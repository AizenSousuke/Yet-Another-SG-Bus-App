import express from "express";
const router = express.Router();
import authMiddleware from "../../middleware/auth";
import PrismaSingleton from "../../classes/PrismaSingleton";
const prisma = PrismaSingleton.getPrisma();

/**
 * Get the settings object
 */
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
						goingHome: {
							include: {
								busStop: true
							}
						},
						goingOut: {
							include: {
								busStop: true
							}
						}
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

/**
 * Save everything instead of just a code.
 * Resets all bus stops data.
 */
router.put(
	"/update/all",
	authMiddleware,
	async (req: any, res) => {
		try {
			console.log("Updating settings");
			const userId = req.user.id;
			console.log("req.user: " + JSON.stringify(req.user));
			console.log("req.body: " + JSON.stringify(req.body));

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
											busStopCode: busStopCode
										}
									},
								}))
							},
							goingHome: {
								set: [], // Remove all entries before updating
								create: req.body.settings.GoingHome.map(busStopCode => ({
									busStop: {
										connect: {
											busStopCode: busStopCode
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

/**
 * Update settings based on code and Going out prop
 */
router.put("/update",
	authMiddleware,
	async (req: any, res) => {
		try {
			const userId = req.user.id;
			const { code, GoingOut } = req.body;

			// Find the bus stop matching the code
			const busStop = await prisma.busStop.findUnique({
				where: { busStopCode: code },
				select: { busStopCode: true }, // Get only the busStopCode
			});

			if (!busStop) {
				return res.status(404).json({ error: "Bus stop not found" });
			}

			const updatedSettings = await prisma.setting.upsert({
				where: { userId },
				create: {
					userId,
					settingsSchema: {
						create: {
							[GoingOut ? "goingOut" : "goingHome"]: {
								create: {
									busStop: {
										connect: { busStopCode: busStop.busStopCode }
									}
								}
							}
						}
					}
				},
				update: {
					settingsSchema: {
						upsert: {
							create: {
								[GoingOut ? "goingOut" : "goingHome"]: {
									create: {
										busStop: {
											connect: { busStopCode: busStop.busStopCode }
										}
									}
								}
							},
							update: {
								[GoingOut ? "goingOut" : "goingHome"]: {
									create: {
										busStop: {
											connect: {
												busStopCode: busStop.busStopCode
											}
										},
									}
								},
							},
						}
					},
				},
				include: { settingsSchema: true },
			});

			return res.status(200).json({ msg: "Successfully updated code to settings", settings: updatedSettings });
		} catch (error) {
			console.error("Error updating settings:", error);
			return res.status(500).json({ error: "Failed to update settings" });
		}
	})

/**
 * Remove code from settings depending on GoingOut prop
 */
router.put("/remove",
	authMiddleware,
	async (req: any, res) => {
		try {
			const userId = req.user.id;
			const { code, GoingOut } = req.body;

			// Find the bus stop matching the code
			const busStop = await prisma.busStop.findUnique({
				where: { busStopCode: code },
				select: { id: true }, // Get only the ObjectId
			});

			if (!busStop) {
				return res.status(404).json({ error: "Bus stop not found" });
			}

			const updatedSettings = await prisma.setting.update({
				where: { userId },
				data: {
					settingsSchema: {
						update: {
							[GoingOut ? "goingOut" : "goingHome"]: {
								deleteMany: {
									busStopId: busStop.id
								},
							},
						},
					},
				},
				include: { settingsSchema: true },
			});

			return res.status(200).json({ msg: "Successfully removed code from settings", settings: updatedSettings });
		} catch (error) {
			console.error("Error updating settings:", error);
			return res.status(500).json({ error: "Failed to update settings" });
		}
	})

/**
 * Delete the entire settings for the user
 * */
router.delete("/delete",
	authMiddleware,
	async (req: any, res) => {
		try {
			const userId = req.user.id;

			const settingsExists = await prisma.setting.findUnique({
				where: {
					userId: userId
				}
			});

			if (!settingsExists) {
				return res.status(404).json({ msg: "Settings not found" });
			}

			await prisma.setting.delete({
				where: {
					userId: userId
				}
			});

			return res.status(200).json({ msg: "Successfully deleted settings", settings: null });
		} catch (error) {
			console.error("Error deleting settings:", error);
			return res.status(500).json({ error: "Failed to delete settings" });
		}
	})

export default router;
