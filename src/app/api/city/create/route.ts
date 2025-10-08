import { NextRequest, NextResponse } from "next/server";
import connectToMongo from "@/app/utils/connectMongo";
import { cityModel } from "../../../../../models/CityModel";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function transliterateToLatin(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya",
    А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "E", Ж: "Zh", З: "Z", И: "I",
    Й: "Y", К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T",
    У: "U", Ф: "F", Х: "H", Ц: "Ts", Ч: "Ch", Ш: "Sh", Щ: "Sch", Ъ: "", Ы: "Y", Ь: "",
    Э: "E", Ю: "Yu", Я: "Ya",
  };
  return input.split("").map(ch => map[ch] ?? ch).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCity = String(body?.city || "").trim();
    const rawCountry = String(body?.country || "").trim();
    const parts = rawCity.split(",");
    const city = parts[0]?.trim() || rawCity;
    const country = rawCountry || (parts[1]?.trim() || "");
    const image = String(body?.image || "").trim();

    if (!city || !country) {
      return NextResponse.json({ error: "city and country are required" }, { status: 400 });
    }

    await connectToMongo();

    // If exists, return existing
    const existing = await cityModel.findOne({ city, country }).lean();
    if (existing) {
      return NextResponse.json(existing);
    }

    // Generate data (prefer Vertex REST → Vertex SDK → Gemini)
    const prompt = `Сгенерируй ДАННЫЕ В СТРОГОМ JSON без комментариев и форматирования кода.
Город: ${city}.

Требуемая структура JSON:
{
  "description": string,
  "places": [
    { "name": string, "price": number, "link": string },
    { "name": string, "price": number, "link": string },
    { "name": string, "price": number, "link": string }
  ],
  "foodPrice": number,
  "hotelPrice": number
}

Требования:
- Верни ТОЛЬКО валидный JSON без пояснений и markdown.
- Цены указывай ориентировочно для Казахстана в тенге (₸), НО в числовом формате без символа.
- Ссылки указывай на официальные сайты или туристические страницы, если известно, иначе пустую строку.
- Пиши на русском языке.`;

    let text = "";
    if (process.env.VERTEX_API_KEY) {
      const modelId = process.env.VERTEX_PUBLISHER_MODEL || "gemini-2.5-flash-lite";
      const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelId}:generateContent?key=${encodeURIComponent(process.env.VERTEX_API_KEY)}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      });
      if (!resp.ok) return NextResponse.json({ error: `Vertex REST error: ${resp.status}` }, { status: 500 });
      const dataJson: any = await resp.json();
      const parts = dataJson?.candidates?.[0]?.content?.parts || [];
      text = parts.map((p: any) => p?.text || "").join("");
    } else if (process.env.VERTEX_PROJECT && process.env.VERTEX_LOCATION) {
      try {
        const { VertexAI } = (await import("@google-cloud/vertexai")) as any;
        const vertex = new VertexAI({ project: process.env.VERTEX_PROJECT, location: process.env.VERTEX_LOCATION });
        const modelId = process.env.VERTEX_MODEL_ID || "gemini-1.5-flash-002";
        const generativeModel = vertex.getGenerativeModel({ model: modelId });
        const resp = await generativeModel.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        const parts = resp?.response?.candidates?.[0]?.content?.parts || [];
        text = parts.map((p: any) => p?.text || "").join("");
      } catch {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        text = result.response.text();
      }
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    // robust parse
    const tryParse = (s: string) => {
      try { return JSON.parse(s); } catch { return null; }
    };
    let parsed: any = tryParse(text);
    if (!parsed) {
      const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fence?.[1]) parsed = tryParse(fence[1].trim());
    }
    if (!parsed && text.trim().startsWith("{") && text.trim().endsWith("}")) parsed = tryParse(text.trim());
    if (typeof parsed?.description === "string") {
      const inner = tryParse(parsed.description);
      if (inner && typeof inner === "object") parsed = inner;
    }
    const safe = {
      description: typeof parsed?.description === "string" ? parsed.description : "",
      places: Array.isArray(parsed?.places) ? parsed.places.map((p: any) => ({
        name: typeof p?.name === "string" ? p.name : "Без названия",
        price: Number.isFinite(Number(p?.price)) ? Number(p.price) : 0,
        link: (typeof p?.link === "string" && p.link.trim().length > 0) ? p.link : "#",
      })) : [],
      foodPrice: Number.isFinite(Number(parsed?.foodPrice)) ? Number(parsed.foodPrice) : 0,
      hotelPrice: Number.isFinite(Number(parsed?.hotelPrice)) ? Number(parsed.hotelPrice) : 0,
    };

    // Try to get image from Unsplash if not provided
    let fetchedImage = image;
    if (!fetchedImage && process.env.UNSPLASH_ACCESS_KEY) {
      try {
        const q = encodeURIComponent(transliterateToLatin(city));
        console.log("city", q)
        const u = `https://api.unsplash.com/search/photos?query=${q}&orientation=landscape&per_page=1&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
        const r = await fetch(u);
        if (r.ok) {
          const j: any = await r.json();
          const first = j?.results?.[0];
          fetchedImage = first?.urls?.regular || first?.urls?.small || "";
        }
      } catch {}
    }

    const fallbackImage = fetchedImage || "/next.svg";
    const fallbackDescr = (safe.description && safe.description.trim().length > 0)
      ? safe.description
      : `Описание для ${city} будет добавлено позже.`;

    const doc = await cityModel.create({
      isMarked: false,
      country,
      city,
      descr: fallbackDescr,
      image: fallbackImage,
      destinations: safe.places,
      foodPrice: safe.foodPrice || 0,
      hotelPrice: safe.hotelPrice || 0,
    });

    return NextResponse.json(doc);
  } catch (err) {
    const message = (err as any)?.message || "Failed to create city";
    console.error("/api/city/create error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


