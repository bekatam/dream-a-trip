const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

const connectToMongo = async () => {
	await mongoose.connect(MONGO_URL);
};

export default connectToMongo;
