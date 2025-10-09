const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectToMongo = async () => {
	const MONGO_URL = process.env.MONGO_URL;
	if (!MONGO_URL) {
		throw new Error("MONGO_URL is not set");
	}
	if (mongoose.connection.readyState >= 1) {
		return;
	}
	await mongoose.connect(MONGO_URL);
};

export default connectToMongo;
