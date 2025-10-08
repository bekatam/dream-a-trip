import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToMongo from "@/app/utils/connectMongo";
import { cityModel } from "../../../../models/CityModel";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { selectedCity, cityId } = data;
    if (!selectedCity || typeof selectedCity !== "string") {
      return NextResponse.json({ error: "Selected city is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const prompt = `Сгенерируй ДАННЫЕ В СТРОГОМ JSON без комментариев и форматирования кода. 
Город: ${selectedCity}.

Требуемая структура JSON:
{
  "description": string, // 80-120 слов на русском, дружелюбный тон, без списков
  "places": [
    { "name": string, "price": number, "link": string },
    { "name": string, "price": number, "link": string },
    { "name": string, "price": number, "link": string }
  ],
  "foodPrice": number, // средняя стоимость питания в день, в тенге
  "hotelPrice": number // средняя стоимость проживания за ночь, в тенге
}

Требования:
- Верни ТОЛЬКО валидный JSON без пояснений и markdown.
- Цены указывай ориентировочно для Казахстана в тенге (₸), НО в числовом формате без символа.
- Ссылки указывай на официальные сайты или туристические страницы, если известно, иначе пустую строку.
- Пиши на русском языке.`;
    let text = "";

    // 1) Prefer Vertex Publisher REST with API key if provided
    if (process.env.VERTEX_API_KEY) {
      const modelId = process.env.VERTEX_PUBLISHER_MODEL || "gemini-2.5-flash-lite";
      const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelId}:generateContent?key=${encodeURIComponent(process.env.VERTEX_API_KEY)}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      });
      if (!resp.ok) {
        throw new Error(`Vertex REST error: ${resp.status}`);
      }
      const dataJson: any = await resp.json();
      const parts = dataJson?.candidates?.[0]?.content?.parts || [];
      text = parts.map((p: any) => p?.text || "").join("");
    }
    // 2) Otherwise try Vertex SDK if project/location configured
    else if (!!process.env.VERTEX_PROJECT && !!process.env.VERTEX_LOCATION) {
      try {
        // Dynamic import to avoid hard dependency when package is not installed
        const { VertexAI } = (await import("@google-cloud/vertexai")) as any;
        const vertex = new VertexAI({
          project: process.env.VERTEX_PROJECT,
          location: process.env.VERTEX_LOCATION,
        });
        const modelId = process.env.VERTEX_MODEL_ID || "gemini-1.5-flash-002";
        const generativeModel = vertex.getGenerativeModel({ model: modelId });
        const resp = await generativeModel.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        });
        const parts = resp?.response?.candidates?.[0]?.content?.parts || [];
        text = parts.map((p: any) => p?.text || "").join("");
      } catch (e) {
        // Fallback to Gemini Web API if Vertex is not available
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        text = result.response.text();
      }
    } else {
      // Default: Gemini Web API
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    // Try to parse JSON robustly, including markdown-fenced payloads
    let parsed: any = null;
    const tryParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    };

    // 1) direct parse
    parsed = tryParse(text);

    // 2) code-fence extract ```...```
    if (!parsed) {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenceMatch && fenceMatch[1]) {
        parsed = tryParse(fenceMatch[1].trim());
      }
    }

    // 3) if still no object, see if description itself contains JSON
    if (!parsed && typeof text === "string") {
      const inner = text.trim();
      if (inner.startsWith("{") && inner.endsWith("}")) {
        parsed = tryParse(inner);
      }
    }

    if (!parsed) {
      // Fallback: wrap as plain description
      parsed = {
        description: text,
        places: [],
        foodPrice: 0,
        hotelPrice: 0,
      };
    }

    // handle cases where fields themselves are stringified JSON
    if (typeof parsed?.description === "string") {
      const maybeObj = tryParse(parsed.description);
      if (maybeObj && typeof maybeObj === "object") {
        parsed = maybeObj;
      }
    }

    // Минимальная валидация типов
    const safe = {
      description: typeof parsed?.description === "string" ? parsed.description : "",
      places: Array.isArray(parsed?.places)
        ? parsed.places
            .slice(0, 6)
            .map((p: any) => ({
              name: typeof p?.name === "string" ? p.name : "",
              price: Number.isFinite(Number(p?.price)) ? Number(p.price) : 0,
              link: typeof p?.link === "string" ? p.link : "",
            }))
        : [],
      foodPrice: Number.isFinite(Number(parsed?.foodPrice)) ? Number(parsed.foodPrice) : 0,
      hotelPrice: Number.isFinite(Number(parsed?.hotelPrice)) ? Number(parsed.hotelPrice) : 0,
    };

    // If cityId provided, persist to Mongo ONLY when fields missing
    if (cityId && typeof cityId === "string") {
      try {
        await connectToMongo();
        const doc = await cityModel.findById(cityId);
        if (doc) {
          const needDescr = !(typeof doc.descr === "string" && doc.descr.trim().length > 0)
          const needDest = !(Array.isArray(doc.destinations) && doc.destinations.length > 0)

          if (needDescr && typeof safe.description === "string" && safe.description.trim().length > 0) {
            doc.descr = safe.description;
          }
          if (needDest && Array.isArray(safe.places) && safe.places.length > 0) {
            doc.destinations = safe.places.map((p: any) => ({ name: p.name, price: p.price, link: p.link }));
          }
          // цены заполняем только если нули (отсутствуют)
          if (!Number(doc.foodPrice) && Number.isFinite(Number(safe.foodPrice))) {
            doc.foodPrice = Number(safe.foodPrice);
          }
          if (!Number(doc.hotelPrice) && Number.isFinite(Number(safe.hotelPrice))) {
            doc.hotelPrice = Number(safe.hotelPrice);
          }
          if (needDescr || needDest || !Number(doc.foodPrice) || !Number(doc.hotelPrice)) {
            await doc.save();
          }
        }
      } catch (e) {
        // Ignore persistence errors, still return AI data
      }
    }

    return NextResponse.json(safe);
  } catch (err) {
    const message = (err as any)?.message || "Failed to generate description";
    console.error("/api/describe error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


