const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectToMongo = async () => {
	const NEXT_PUBLIC_MONGO_URL = await process.env.NEXT_PUBLIC_MONGO_URL;
	await mongoose.connect(
		NEXT_PUBLIC_MONGO_URL,
		{ useNewUrlParser: true },
		{ useUnifiedTopology: true }
	);
};

export default connectToMongo;
