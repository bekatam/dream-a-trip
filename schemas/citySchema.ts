import { Schema } from "mongoose";
import { ICity } from "../interfaces/ICity";
export const citySchema = new Schema<ICity>({
	isMarked: { type: Boolean, required: true },
	country: { type: String, required: true },
	city: { type: String, required: true },
	price: { type: Number, required: true },
	descr: { type: String, required: true },
	image: { type: String, required: true },
});
