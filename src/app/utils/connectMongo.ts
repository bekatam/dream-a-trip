const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectToMongo = async () => {
	const MONGO_URL = await process.env.MONGO_URL;
	console.log(MONGO_URL);
	await mongoose.connect(
		MONGO_URL,
		{ useNewUrlParser: true },
		{ useUnifiedTopology: true }
	);
};

export default connectToMongo;
