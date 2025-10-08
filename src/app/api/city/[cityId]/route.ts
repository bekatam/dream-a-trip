import connectToMongo from "@/app/utils/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import { cityModel } from "../../../../../models/CityModel";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ cityId: string }> }
) {
	const { cityId } = await params;
	await connectToMongo();
	const result = await req.json();
	const item = await cityModel.findById(cityId);
	item.destinations.push({
		name: result.name,
		price: result.price,
		link: " ",
	});
	await item.save();
	return NextResponse.json(item);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ cityId: string }> }
) {
	const { cityId } = await params;
	try {
		await connectToMongo();

		const city = await cityModel.findById(cityId);

		const destinationIndex = city.destinations.findIndex(
			(destination: any) => destination._id.toString() === cityId
		);

		city.destinations.splice(destinationIndex, 1);

		await city.save();

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ ok: false }, { status: 500 });
	}
}
