import express from "express";
const router = express.Router();
import authMiddleware from "../../middleware/auth";
import { check, validationResult } from "express-validator";
import PrismaSingleton from "../../classes/PrismaSingleton";
const prisma = PrismaSingleton.getPrisma();

router.get("/", authMiddleware, async (req: any, res) => {
	console.log("Request headers: " + JSON.stringify(req.headers));
	console.log("Request url: " + req.url);
	console.log("Req user: " + JSON.stringify(req.user));
	const settings = await prisma.setting.findFirst
		({
			where: {
				userId: req.user.UserId,
			},
			include: {
				settingsSchema: {
					include: {
						goingHome: true,
						goingOut: true
					}
				}
			}
		});

	if (!settings) {
		console.log("No settings in database");
		return res
			.status(200)
			.json({
				settings: null,
				msg: "There are no settings for this user."
			});
	}

	console.log("Successfully loaded settings: " + JSON.stringify(settings));
	return res.status(200).json({
		msg: "Successfully loaded settings",
		settings: settings,
	});
});

// To refactor to handle business logic on backend instead of frontend
// router.put(
// 	"/",
// 	[check("settings", "Settings data structure is required").notEmpty()],
// 	authMiddleware,
// 	async (req: any, res) => {
// 		try {
// 			console.log("Request headers: " + JSON.stringify(req.headers));
// 			console.log("Request url: " + req.url);
// 			console.log("Req user: " + JSON.stringify(req.user));
// 			console.log("Body:" + JSON.stringify(req.body));
// 			const errors = validationResult(req);
// 			if (!errors.isEmpty()) {
// 				return res.status(422).json({ errors: errors.array() });
// 			}

// 			const { settings } = req.body;

// 			// Create if it does not exist
// 			const settingsUpdateTime = new Date(Date.now());
// 			const updatedSettings = await prisma.setting.update({
// 				where: {
// 					userId: req.user.UserId
// 				},
// 				data: {
// 					settingsSchema: settings,
// 					updatedAt: settingsUpdateTime
// 				}
// 			});

// 			return res.status(200).json({
// 				msg: `User settings has been updated at ${updatedSettings.updatedAt}.`,
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			return res.status(500).json({ msg: "Server error" });
// 		}
// 	}
// );

/**
 * Save everything instead of just a code
 */
router.put(
	"/update",
	[
		// check("code", "Code is required").notEmpty(),
		// check("GoingOut", "GoingOut boolean property is required").notEmpty(),
		// check("busesTracked", "busesTracked boolean property is required").notEmpty(),
	],
	authMiddleware,
	async (req: any, res) => {
		try {
			console.log("Updating settings");
			// const fieldToUpdate = !req.body.settings.GoingOut ? "goingHome" : "goingOut";
			// console.log("fieldToUpdate: " + fieldToUpdate);
			const userId = req.user.id;
			console.log("req.user: " + JSON.stringify(req.user));
			console.log("req.body: " + JSON.stringify(req.body));
			// const busStopCode = req.body.code;
			// const busesTracked = req.body.busesTracked;

			// const existingSettings = await prisma.setting.findFirstOrThrow({
			// 	where: {
			// 		userId: userId
			// 	},
			// 	include: {
			// 		settingsSchema: {
			// 			include: {
			// 				goingHome: {
			// 					include: {
			// 						busStop: true
			// 					}
			// 				},
			// 				goingOut: {
			// 					include: {
			// 						busStop: true
			// 					}
			// 				}
			// 			}
			// 		}
			// 	}
			// });
			
			const existingSettings = await prisma.setting.upsert({
				where: { userId: userId },
				update: {
					settingsSchema: {
						update: {
							goingOut: {
								set: [], // Remove all entries before updating
								create: req.body.settings.GoingOut.map(busStopCode => ({
									busStop: {
										connect: {
											busStopCode
										}
									},
								}))
							}
						}
					}
				},
				create: {
				  userId: userId,
				  settingsSchema: {
					create: {
						goingHome: {
						  create: [] // Ensure it matches the expected type
						},
						goingOut: {
						  create: [] // Ensure it matches the expected type
						}
					}
				  }
				},
				include: {
				  settingsSchema: {
					include: {
					  goingHome: { include: { busStop: true } },
					  goingOut: { include: { busStop: true } }
					}
				  }
				}
			  });			  

			console.log("existingSettings:", existingSettings);

			return res.status(200).json({ msg: "Successfully updated settings." });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ msg: "Something went wrong." });
		}
	}
)

// router.delete(
// 	"/delete",
// 	[
// 		check("code", "Code is required").notEmpty(),
// 		check("GoingOut", "GoingOut boolean property is required").notEmpty(),
// 	],
// 	authMiddleware,
// 	async (req: any, res) => {
// 		try {
// 			console.log("Deleting settings");
// 			const errors = validationResult(req);
// 			console.log(JSON.stringify(errors));
// 			if (!errors.isEmpty()) {
// 				res.status(422).json({ errors: errors.array() });
// 			}

// 			const code = req.body.code;
// 			const GoingOut = req.body.GoingOut;
// 			console.log(`Code: ${code}, GoingOut: ${GoingOut}`);
// 			if (!code) {
// 				return res.status(422).json({
// 					msg: "There is no code provided. Bus stop not deleted.",
// 				});
// 			}
// 			if (GoingOut == null) {
// 				return res.status(422).json({
// 					msg: "There is no GoingOut boolean property provided. Bus stop not deleted.",
// 				});
// 			}

// 			let settings = await prisma.setting.findFirst({
// 				where: {
// 					userId: req.user.UserId,
// 				}
// 			});

// 			if (!settings) {
// 				return res.status(404).json({
// 					msg: "There are no settings found.",
// 				});
// 			}

// 			console.log("Settings: " + JSON.stringify(settings));

// 			// Delete items from settings
// 			let newSettings = null;
// 			if (GoingOut) {
// 				newSettings = Object.assign(
// 					{},
// 					{
// 						GoingOut: settings.Settings?.GoingOut?.filter(
// 							(c) => c !== code
// 						),
// 						GoingHome: settings.Settings?.GoingHome,
// 					},
// 				);
// 			} else if (GoingOut == false) {
// 				newSettings = Object.assign(
// 					{},
// 					{
// 						GoingOut: settings.Settings?.GoingOut,
// 						GoingHome: settings.Settings?.GoingHome?.filter(
// 							(c) => c !== code
// 						),
// 					}
// 				);
// 			}

// 			console.log(
// 				"New Settings after deleting: " + JSON.stringify(newSettings)
// 			);

// 			let UpdatedSettings = await Settings.findOneAndUpdate(
// 				{ UserId: req.user.UserId },
// 				{ Settings: newSettings, DateUpdated: Date.now() },
// 				{ upsert: true, new: true, setDefaultsOnInsert: true }
// 			);

// 			return res.status(200).json({
// 				msg: `User settings has been deleted at ${UpdatedSettings.DateUpdated}.`,
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			return res.status(500).json({ msg: "Server error" });
// 		}
// 	}
// );

// router.delete("/", authMiddleware, async (req: any, res) => {
// 	try {
// 		const user = req.user;
// 		let settings = await Settings.findOneAndDelete({ UserId: user.UserId });
// 		if (!settings) {
// 			return res.status(404).json({ msg: "User settings not found" });
// 		}

// 		return res.status(200).json({ msg: "Successfully deleted settings" });
// 	} catch (error) {
// 		console.error(error.message);
// 		return res.status(500).json({ msg: "Server error" });
// 	}
// });

export default router;
