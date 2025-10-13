import connectToMongo from "@/app/utils/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import { cityModel } from "../../../../models/CityModel";

export async function GET(req: NextRequest) {
    await connectToMongo();
    // Fetch all cities
    const result = await cityModel.find({});

    // Identify cities missing destinations
    const missing = result.filter((c: any) => !Array.isArray(c?.destinations) || c.destinations.length === 0);

    if (missing.length > 0) {
        try {
            const baseUrl = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            // Generate in parallel, but don't fail the whole request
            await Promise.allSettled(
                missing.map((c: any) =>
                    fetch(`${baseUrl}/api/describe`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ selectedCity: c.city, cityId: String(c._id) }),
                    })
                )
            );

            // Re-fetch after generation to return updated cities
            const updated = await cityModel.find({});
            return NextResponse.json(updated);
        } catch (e) {
            // If generation failed, still return current list
            return NextResponse.json(result);
        }
    }

    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
	await connectToMongo();
	const {
		isMarked,
		city,
		country,
		descr,
		image,
		destinations,
		price,
		foodPrice,
		hotelPrice,
	} = await req.json();
	const test = new cityModel({
		city,
		country,
		price,
		isMarked,
		descr,
		image,
		destinations,
		foodPrice,
		hotelPrice,
	});
	await test.save();
	return NextResponse.json(test);
}
