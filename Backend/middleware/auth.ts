import jwt from "jsonwebtoken";
import config from "config";
import { PrismaClient } from "@prisma/client";
import PrismaSingleton from "../classes/PrismaSingleton";

const prisma: PrismaClient = PrismaSingleton.getPrisma();

const Auth = async (req, res, next) => {
	console.log("Running middleware");
	try {
		// Get token from headers
		console.log(req.headers);
		const token = req.header("x-auth-token");
		console.log("Token in req header: " + JSON.stringify(token));

		// Check if no token is provided
		if (!token) {
			console.log("No token was provided in x-auth-token header.");

			return res
				.status(401)
				.json({ msg: "No token provided. Authorization denied." });
		}

		// Get user whose token match in mongo
		const user = await prisma.user.findUnique({
			where: { token: token }
		});

		console.log("Auth User: " + JSON.stringify(user));

		if (!user) {
			console.log("User with token is not found. Returning 401.")
			return res.status(401).json({
				msg: "Token is not valid. It might have expired. Please relogin.",
			});
		}

		if (user) {
			// Check token has not expired
			console.log("Date today: " + Date.now());
			if (user.tokenExpiryDate > new Date()) {
				console.log("Setting request user: " + JSON.stringify(user));
				req.user = user;
				return next();
			}

			// If expired
			console.warn("Expired token");
			return res
				.status(401)
				.json({ msg: "Token has expired. Please re-login." });
		}
		return res
			.status(500)
			.json({ msg: "There is some issue with the request." });
	} catch (error) {
		console.error(error);
		return res.status(401).json({ msg: error.message });
	}

	// Verify token
	// try {
	// 	const decoded = jwt.verify(token, config.get("jwtSecret"));
	// 	req.user = decoded.user;
	// 	next();
	// } catch (error) {
	// 	return res.status(401).json({ msg: "Token is not valid" });
	// }
};

export default Auth;