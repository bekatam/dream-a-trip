import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String },
		image: { type: String },
		provider: { type: String },
		favorites: { type: [String], default: [] },
		budgets: { 
			type: Map, 
			of: {
				destinations: [{
					name: String,
					price: Number,
					link: String,
					isBlurred: Boolean,
					_id: String
				}],
				foodPrice: Number,
				hotelPrice: Number,
				totalPrice: Number,
				lastUpdated: { type: Date, default: Date.now }
			},
			default: new Map()
		},
		settings: {
			currency: { type: String, default: "KZT" },
			language: { type: String, default: "ru" },
			notifications: { type: Boolean, default: true }
		},
	},
	{ timestamps: true }
)

export default UserSchema


