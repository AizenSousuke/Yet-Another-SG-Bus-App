import { User } from './../../node_modules/.prisma/client/index.d';
import express from "express";
const router = express.Router();
import authMiddleware from "../../middleware/auth";
import bcrypt from "bcryptjs";
import config from "config";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import passport from "passport";
import PrismaSingleton from "../../classes/PrismaSingleton";

const prisma = PrismaSingleton.getPrisma();

router.get('/test', async (req: any, res) => {
	return res.status(200).json("OK");
})

/**
 * Using the auth middleware to check the json web token
 */
router.get("/", authMiddleware, async (req: any, res) => {
	try {
		console.log("Getting auth");
		console.log("Type of UserId: ", typeof req.user.UserId);
		const user = await prisma.user.findUnique({
			where: {
				id: req.user.UserId,
			}
			// TODO: Hide password
		});
		if (!user) {
			return res.status(401).json({ msg: "No user is logged in" });
		}

		return res.status(200).json({ msg: user });
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Server error" });
	}
});

/**
 * Authentication endpoint for facebook login
 */
router.get(
	"/facebook",
	passport.authenticate("facebook", { scope: ["email"] })
);

/**
 * Callback url for facebook login
 */
router.get(
	"/facebook/callback",
	passport.authenticate("facebook", {
		scope: ["email"],
	}),
	(req: any, res) => {
		console.log(
			"Req user from facebook callback: " + JSON.stringify(req.user)
		);
		console.log(
			"Req isAuthenticated from facebook callback: " +
			req.isAuthenticated()
		);
		req.session.save(async (error) => {
			console.log(`Backend config FRONTEND_LINK is: ${config.FRONTEND_LINK}`)
			console.log(`Backend req.user is: ${JSON.stringify(req.user)}`)

			// Update user token
			console.log("Updating user token with: " + req.user.token);
			await prisma.user.update({
				where: {
					email: req.user.email
				},
				data: {
					token: req.user.token
				}
			});

			console.log("Done updating user token");

			const redirectURL =
				(process.env.FRONTEND_LINK ?? config.FRONTEND_LINK) +
				`?token=${req.user.token}`;
			console.warn("Redirecting to frontend link " + redirectURL);
			return res.status(302).redirect(
				// Redirect back to app
				redirectURL
			);
		});
	}
);

/**
 * Check token expiry endpoint
 */
router.get("/checkTokenExpiry", async (req: any, res) => {
	console.log(
		"Checking Token Expiry for x-auth-token: " + req.header("x-auth-token")
	);
	if (!req.header("x-auth-token")) {
		return res
			.status(200)
			.json({ msg: "Token has expired", expired: true });
	}

	const user = await prisma.user.findFirst({
		where: {
			token: req.header("x-auth-token"),
		}
	});

	if (!user) {
		return res.status(200).json({ msg: "Cannot find user", expired: true });
	}

	console.log("User with Token Expiry Date: " + user.tokenExpiryDate);
	const DateToday = new Date(Date.now());
	console.log("Date today: " + DateToday);
	const ExpiryDate = new Date(user.tokenExpiryDate);
	console.log("Expiry Date: " + ExpiryDate);
	if (DateToday > ExpiryDate) {
		console.log("Token has expired");
		return res
			.status(200)
			.json({ msg: "Token has expired", expired: true });
	}

	console.log("Token has not expired");
	return res
		.status(200)
		.json({ msg: "Token has not expired", expired: false });
});

/**
 * Logs the current user out
 */
router.get("/logout", (req: any, res) => {
	req.logout();
	res.status(200).json(true);
});

/**
 * Sign in with email and password then returns jwt_token
 */
router.post(
	"/signin",
	[
		check(
			"Email",
			"Email is required. Please enter a valid email."
		).isEmail(),
		check("Password", "Password is required").exists(),
	],
	async (req: any, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ msg: errors.array() });
			}

			const { Email, Password } = req.body;

			console.log("Is prisma null?", prisma == null);

			// const allUser = await prisma.user.findMany({});
			// console.log("All users: " + JSON.stringify(allUser));

			const user = await prisma.user.findFirst(
				{
					where: {
						email: Email,
					}
				});

			if (!user) {
				return res.status(400).json({ msg: "Invalid Credentials" });
			}

			const isMatch = await bcrypt.compare(Password, user.password);

			if (!isMatch) {
				return res.status(400).json({ msg: "Invalid Password" });
			}

			console.warn("User: " + JSON.stringify(user));

			// Return jsonwebtoken (so user can log in straightaway)
			const payload = {
				user: {
					Id: user.id,
					IsAdmin: user.isAdmin,
				},
			};

			const tokenExpiresIn = 36000000;

			jwt.sign(
				payload,
				process.env.jwtSecret ?? config.get("jwtSecret"),
				{ expiresIn: tokenExpiresIn },
				async (error, token) => {
					if (error) throw error;

					// Calculate the token expiration date
					const expirationDate = new Date();
					expirationDate.setSeconds(
						expirationDate.getSeconds() + tokenExpiresIn
					);

					console.log("Updating user with new token");

					// Save token to user entity in db
					await prisma.user.update({
						where: {
							email: Email,
						},
						data: {
							token: token,
							tokenExpiryDate: expirationDate,
							// No refresh token (TODO: Need to generate it above when creating the jwt token)
						}
					}
					);

					return res.json({ token });
				}
			);

			console.log("Done signing in");
		} catch (error) {
			console.log(error);
			return res.status(500).json({ msg: "Server error" });
		}
	}
);

export default router;
