import { Schema } from "mongoose";
import { ICity } from "../interfaces/ICity";

export const citySchema = new Schema<ICity>({
	isMarked: { type: Boolean, required: true },
	country: { type: String, required: true },
	city: { type: String, required: true },
	descr: { type: String, required: true },
	image: { type: String, required: true },
	destinations: {
		type: [
			{
				name: { type: String, required: true },
				price: { type: Number, required: true },
				link: { type: String, required: true },
			},
		],
		required: true,
	},
	price: { type: Number, default: 0 },
	foodPrice: { type: Number, required: true },
	hotelPrice: { type: Number, required: true },
});

citySchema.pre<ICity>("save", function (next) {
	if (this.destinations && this.destinations.length > 0) {
		const totalPrice = this.destinations.reduce(
			(acc, destination) => acc + destination.price,
			0
		);
		this.price = totalPrice + this.foodPrice + this.hotelPrice;
	} else {
		this.price = this.foodPrice + this.hotelPrice;
	}
	next();
});
