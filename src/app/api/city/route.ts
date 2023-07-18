import connectToMongo from "@/app/utils/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import { cityModel } from "../../../../models/CityModel";

const run = async () => {
	await connectToMongo();
};

run();

export async function GET(req: NextRequest, res: NextResponse) {
	const result = await cityModel.find({});
	return await new Response(JSON.stringify(result));
}

export async function POST(req: NextRequest, res: NextResponse) {
	const { isMarked, city, country, price, descr, image } = await req.json();
	const test = new cityModel({
		price,
		city,
		country,
		isMarked,
		descr,
		image,
	});
	await test.save();
	return new Response(JSON.stringify(test));
}
