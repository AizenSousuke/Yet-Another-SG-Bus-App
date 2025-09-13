const mongoose = require("mongoose");
const configuration = require("config");
console.log("mongoURI process.env.mongoURI: " + process.env.mongoURI);
const db = process.env.mongoURI ?? configuration.get("mongoURI");
console.log("db: " + db);

export const connectDB = async () => {
	try {
		await mongoose.connect(db);
		console.log("MongoDB connected to", process.env.NODE_ENV, "servers with token expiry days:", configuration.TOKEN_EXPIRY_DAYS);
	} catch (err) {
		console.error("MongoDB connection error: {message}",err.message);
		// Exit process with failure
		process.exit(1);
	}
	console.log("Finished connecting to db");
};
