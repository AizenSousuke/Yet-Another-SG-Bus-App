import express from "express";
const router = express.Router();
import { check, validationResult } from "express-validator";
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import config from "config";
import jwt from "jsonwebtoken";
import PrismaSingleton from "../../classes/PrismaSingleton";
import prisma from "../../classes/PrismaSingleton";
// const prisma = PrismaSingleton.getPrisma();

router.get("/", async (req, res) => {
	try {
		const users = await prisma.user.findMany({});

		if (!users || users.length === 0) {
			return res.status(404).json({ msg: "No user(s) found" });
		}

		return res
			.status(200)
			.json({ msg: "Successfully got the user", users: users });
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ msg: "Server error" });
	}
});

router.post(
	"/",
	[
		check("Name", "Name is required").not().isEmpty(),
		check("Email", "Please include a valid email").isEmail(),
		check(
			"Password",
			"Please enter a password with 6 or more characters"
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { Name, Email, Password } = req.body;

		// See if user exists
		let user = await prisma.user.findFirst({ where: { email: Email } });

		if (user) {
			return res.status(400).json({
				errors: [{ msg: "User already exists" }],
			});
		}

		// Get users gravatar
		const Avatar = gravatar.url(Email, {
			s: "200",
			r: "pg",
			d: "mm",
		});

		// Encrypt password
		const salt = await bcrypt.genSalt(10);

		if (!user) {
			user = await prisma.user.create({
				data: {
					name: Name,
					email: Email,
					avatar: Avatar,
					password: await bcrypt.hash(Password, salt)
				}
			});
		} else {
			user = await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					name: Name,
					email: Email,
					avatar: Avatar,
					password: await bcrypt.hash(Password, salt)
				}
			});
		}

		// Return jsonwebtoken (so user can log in straightaway)
		const payload = {
			user: {
				id: user.id,
			},
		};

		jwt.sign(
			payload,
			process.env.jwtSecret ?? config.get("jwtSecret"),
			{ expiresIn: 3600000 },
			(error, token) => {
				if (error) throw error;
				res.json({ token });
			}
		);
	}
);

router.delete("/", async (req, res) => {
	const email = req.query.email.toString();

	if (!email) {
		return res.status(422).json({ err: "Invalid email address" });
	}
	let user = await prisma.user.findFirst({ where: { email: email } });

	if (!user) {
		return res.status(404).json({ msg: "User not found" });
	}

	const deletedUser = await prisma.user.delete({
		where: {
			id: user.id
		}
	});

	return res
		.status(200)
		.json({ msg: `Removed user with email: ${deletedUser.email}` });
});

export default router;
