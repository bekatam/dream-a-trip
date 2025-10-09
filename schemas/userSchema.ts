import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String },
		image: { type: String },
		provider: { type: String },
	},
	{ timestamps: true }
)

export default UserSchema


