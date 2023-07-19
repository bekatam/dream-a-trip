import connectToMongo from "@/app/utils/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import { cityModel } from "../../../../models/CityModel";

export async function GET(req: NextRequest, res: NextResponse) {
	connectToMongo();
	const result = await cityModel.find({});
	return await new Response(JSON.stringify(result));
}

export async function POST(req: NextRequest, res: NextResponse) {
	connectToMongo();
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
	return new Response(JSON.stringify(test));
}
