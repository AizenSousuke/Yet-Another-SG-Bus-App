const mongoose = require("mongoose");
const configuration = require("config");
const db = process.env.mongoURI ?? configuration.get("mongoURI");

export const connectDB = async () => {
	try {
		await mongoose.connect(db);
		db.BusStop.createIndex({ location: "2dsphere" });

		console.log("MongoDB connected to", process.env.NODE_ENV, "servers with token expiry days:", configuration.TOKEN_EXPIRY_DAYS);
	} catch (err) {
		console.error(err.message);
		// Exit process with failure
		process.exit(1);
	}
};
