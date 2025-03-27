// The express server
import express from "express";
const app = express();
const PORT = process.env.PORT || 8080;
import { connectDB } from "./db";
import cors from "cors";
import config from "config";
import session from "express-session";
import cookieParser from "cookie-parser";

// Add self signed key for https
// const https = require("https");
// const fs = require("fs");
// var key = fs.readFileSync(__dirname + "/config/selfsigned.key");
// var cert = fs.readFileSync(__dirname + "/config/selfsigned.crt");
// var options = {
// 	key: key,
// 	cert: cert,
// };

// Passport
import passport from "passport";
import PrismaSingleton from "./classes/PrismaSingleton";
const FacebookStrategy = require("passport-facebook").Strategy;

const prisma = PrismaSingleton.getPrisma();

if (process.env.NODE_ENV !== "test") {
	// To get HTTPS
	// var server = https.createServer(options, app);
	// server.listen(PORT, (error, result) => {
	// 	console.log(`HTTPS Server started on port ${PORT}`);
	// });

	// Normal way to get http
	app.listen(PORT, () => {
		console.log("Listening on port %s", PORT);
	});
}

// Connect Database
async () => await connectDB();

// Adds middlewares
// Add body-parser middleware
app.use(express.json());
app.use(
	session({
		secret: process.env.jwtSecret ?? config.get("jwtSecret"),
		saveUninitialized: false,
		resave: false,
	})
);
app.use(cookieParser());

// Add CORS
app.use(cors());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID ?? config.FACEBOOK_APP_ID,
			clientSecret:
				process.env.FACEBOOK_APP_SECRET ?? config.FACEBOOK_APP_SECRET,
			callbackURL:
				process.env.FACEBOOK_CALLBACK_URL ??
				config.FACEBOOK_CALLBACK_URL,
			profileFields: ["id", "emails", "name"],
		},
		async (accessToken, refreshToken, profile, cb) => {
			// Save the accessToken and refreshToken if you need to call facebook apis later on
			console.log("Profile: " + JSON.stringify(profile));
			console.log("Email: " + JSON.stringify(profile.emails[0].value));
			console.log("Access Token: " + accessToken);
			// FB does not provide refresh token. So it should be undefined.
			console.log("Refresh Token: " + refreshToken);
			const user = await prisma.user.findFirst({
				where: {
					email: profile.emails[0].value,
					socialId: profile.id,
				}
			});

			if (!user) {
				var date = new Date(Date.now());
				var expiryDate = new Date(date.setDate(
					date.getDate() +
					(process.env.TOKEN_EXPIRY_DAYS ??
						config.get("TOKEN_EXPIRY_DAYS"))
				));

				await prisma.user.create({
					data: {
						// Add social id
						socialId: profile.id,
						name: profile.name.givenName,
						email: profile.emails[0].value,
						token: accessToken,
						refreshToken: refreshToken,
						tokenExpiryDate: expiryDate,
						password: ""
					}
				});

				const user = await prisma.user.findFirstOrThrow({
					where: {
						email: profile.emails[0].value,
					}
				});

				return cb(null, user);
			} else {
				// Save new accessToken
				var date = new Date(Date.now());
				var expiryDate = new Date(date.setDate(
					date.getDate() +
					(process.env.TOKEN_EXPIRY_DAYS ??
						config.get("TOKEN_EXPIRY_DAYS"))
				));

				const updatedUser = await prisma.user.update({
					where: {
						id: user.id
					},
					data: {
						token: accessToken,
						refreshToken: refreshToken,
						tokenExpiryDate: expiryDate
					}
				});

				return cb(null, updatedUser);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser(async (user, done) => {
	try {
		console.log(`Getting user: ${JSON.stringify(user)}`)
		const prismaUser = await prisma.user.findUniqueOrThrow({
			where: {
				email: user.email
			}
		});
		done(null, prismaUser);
	} catch (error) {
		done(error, null);
	}
});

// Define routes
app.use("/api/auth", require("./routes/api/auth").default);
app.use("/api/users", require("./routes/api/users").default);
app.use("/api/busstops", require("./routes/api/busstops").default);
app.use("/api/busroutes", require("./routes/api/busroutes").default);
app.use("/api/busservices", require("./routes/api/busservices").default);
app.use("/api/bus", require("./routes/api/bus").default);
app.use("/api/settings", require("./routes/api/settings").default);
app.use("/api/admin", require("./routes/api/admin").default);

app.get("/", (req, res) => {
	res.send(`Server is on port ${PORT}`);
});

module.exports = app;