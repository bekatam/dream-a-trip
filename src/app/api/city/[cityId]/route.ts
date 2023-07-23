import connectToMongo from "@/app/utils/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import { cityModel } from "../../../../../models/CityModel";

export async function POST(req: NextRequest, res: NextResponse) {
	const url = new URL(req.url);
	const id = url.pathname.split("/")[3];
	await connectToMongo();
	const result = await req.json();
	const item = await cityModel.findById(id);
	item.destinations.push({
		name: result.name,
		price: result.price,
		link: " ",
	});
	item.save();
	return new Response(JSON.stringify(item));
}

export async function DELETE(req: NextRequest, res: NextResponse) {
	const id = req.url.substring(31);
	try {
		await connectToMongo();

		const city = await cityModel.findById(id);

		const destinationIndex = city.destinations.findIndex(
			(destination: any) => destination._id.toString() === id
		);

		city.destinations.splice(destinationIndex, 1);

		await city.save();

		return new Response("ok");
	} catch (error) {
		console.error(error);
		return new Response("not ok");
	}
}
