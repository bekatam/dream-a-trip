import connectToMongo from "@/app/utils/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import { cityModel } from "../../../../../models/CityModel";

export async function POST(req: NextRequest, res: NextResponse) {
	const id = req.url.substring(31);
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

		// Find the city with the given ID
		const city = await cityModel.findById(id);

		// Find the destination index based on the destination ID
		const destinationIndex = city.destinations.findIndex(
			(destination: any) => destination._id.toString() === id
		);

		// Remove the destination from the destinations array
		city.destinations.splice(destinationIndex, 1);

		// Save the updated city
		await city.save();

		return new Response("ok");
	} catch (error) {
		console.error(error);
		return new Response("not ok");
	}
}
