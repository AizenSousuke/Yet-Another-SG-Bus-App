import express from "express";
const router = express.Router();
import auth from "../../middleware/auth";
import axios from "axios";
import config from "config";
const BusStop = require("../../models/DataMall/BusStop").default;
const User = require("../../models/User").default;
import mongoose from "mongoose";
import { check, validationResult } from "express-validator";
import Util from "../../util/Util";
import PrismaSingleton from "../../classes/PrismaSingleton";
const prisma = PrismaSingleton.getPrisma();

const header = {
	Accept: "application/json",
	AccountKey: process.env.LTADataMallAPI ?? config.get("LTADataMallAPI"),
};

router.get("/", async (req: any, res) => {
	return res.status(200).json({ msg: "Ok" });
});

/**
 * Admin endpoint for updating bus stop list
 */
// router.put("/UpdateBusStopList", auth, async (req: any, res) => {
// 	// Check if logged in user is an admin
// 	// Note that auth does not update when admin flag is set in db manually
// 	console.log("User is admin: " + req.user.IsAdmin);
// 	if (req.user.IsAdmin) {
// 		console.log("Getting all bus stops from LTA");
// 		// Get all the bus stops from LTA
// 		let { arrayOfBusStopsPromises, allBusStopsCount } = await getPromisesForAllBusStopsFromLTADataMallAPI(res);

// 		Promise.all(arrayOfBusStopsPromises)
// 			.then(async (data) => {
// 				console.log("Updating data in MongoDB");
// 				// Update Mongoose DB with the data
// 				const session = await mongoose.startSession();
// 				try {
// 					session.startTransaction();

// 					// Drop the whole table first
// 					await BusStop.deleteMany({}).session(session);

// 					for (const stop of arrayOfBusStopsPromises.flat(Infinity)) {
// 						await BusStop.findOneAndUpdate(
// 							{
// 								BusStopCode: stop.BusStopCode,
// 							},
// 							{
// 								RoadName: stop.RoadName,
// 								Description: stop.Description,
// 								Location: [stop.Longitude, stop.Latitude],
// 							},
// 							{ upsert: true }
// 						).session(session);
// 					}

// 					await session.commitTransaction();
// 					await session.endSession();

// 					return res.status(200).json({
// 						msg: "Successfully updated bus stop list",
// 						length: allBusStopsCount,
// 					});
// 				} catch (error) {
// 					await session.abortTransaction();
// 					await session.endSession();
// 					return res
// 						.status(500)
// 						.json({ msg: "Server error", error: error.message });
// 				}
// 			})
// 			.catch((error) => {
// 				return res
// 					.status(500)
// 					.json({ msg: "Server error", error: error.message });
// 			});
// 	} else {
// 		return res.status(403).json({ msg: "You must be an admin to do this" });
// 	}
// });

/**
 * Admin endpoint to set a user as admin using an email address
 */
router.patch(
	"/setAdmin",
	[
		check(
			"Email",
			"Please provide the email address of the user that you want to set an admin as"
		).isEmail(),
		check("IsAdmin", "Please set true or false").isBoolean(),
	],
	auth,
	async (req: any, res) => {
		try {
			const user = req.user;
			if (!user.IsAdmin) {
				return res
					.status(403)
					.json({ msg: "You must be an admin to do this" });
			}
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ msg: errors.array() });
			}
			const { Email, IsAdmin } = req.body;
			const updatedUser = await prisma.user.update({
				where: {
					email: Email,
				},
				data: {
					isAdmin: IsAdmin
				}
			});

			if (!updatedUser) {
				return res.status(404).json({ msg: "No user found" });
			}

			return res.status(200).json({ msg: "Successfully set admin to " + IsAdmin });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ msg: "Something went wrong." });
		}
	}
);

export default router;

// export async function getPromisesForAllBusStopsFromLTADataMallAPI(res) {
// 	let arrayOfBusStops = [];
// 	let allBusStopsCount = 0;
// 	let anyMoreDataToParse = true;
// 	let skip = 0;
// 	let skipBy = 500;

// 	while (anyMoreDataToParse) {
// 		await Util.delay(100);

// 		await axios
// 			.get(
// 				"http://datamall2.mytransport.sg/ltaodataservice/BusStops",
// 				{ headers: header, params: { $skip: skip } }
// 			)
// 			.then(async (response) => {
// 				if (response.data.value.length == 0) {
// 					anyMoreDataToParse = false;
// 					console.log("Finish getting data at skip: " + skip);
// 				}

// 				console.log("response length from datamall api: ", response.data.value.length, "skip:", skip);
// 				allBusStopsCount += response.data.value.length;
// 				response.data.value.map(busStop => {
// 					arrayOfBusStops.push(busStop);
// 				});

// 				return response.data.value;
// 			})
// 			.catch((error) => {
// 				console.error(error.message);
// 				return [];
// 			});

// 		skip += skipBy;
// 	}

// 	return { arrayOfBusStops, allBusStopsCount };
// }

export async function getPromisesForAllBusStopsFromLTADataMallAPI(res) {
    let arrayOfBusStops = [];
    let skip = 0;
    const skipBy = 500;
    const maxParallelRequests = 2; // Adjust as needed

    while (true) {
        await Util.delay(100); 

        const requests = Array.from({ length: maxParallelRequests }, (_, i) =>
            axios.get("http://datamall2.mytransport.sg/ltaodataservice/BusStops", {
                headers: header,
                params: { $skip: skip + i * skipBy }
            }).catch(error => {
                console.error(`Error fetching skip=${skip + i * skipBy}:`, error.message);
                return { data: { value: [] } }; // Prevent breaking the loop
            })
        );

        const responses = await Promise.all(requests);
        const allData = responses.flatMap(res => res.data.value);

        if (allData.length === 0) break;

        arrayOfBusStops.push(...allData);
        skip += skipBy * maxParallelRequests;
        console.log(`Fetched ${allData.length} records, Total: ${arrayOfBusStops.length}`);
    }

    return { arrayOfBusStops, allBusStopsCount: arrayOfBusStops.length };
}

export async function getPromisesForAllBusServicesFromLTADataMallAPI(res) {
    let arrayOfBusServices = [];
    let skip = 0;
    const skipBy = 500;
    const maxParallelRequests = 2; // Adjust as needed

    while (true) {
        await Util.delay(100); 

        const requests = Array.from({ length: maxParallelRequests }, (_, i) =>
            axios.get("http://datamall2.mytransport.sg/ltaodataservice/BusServices", {
                headers: header,
                params: { $skip: skip + i * skipBy }
            }).catch(error => {
                console.error(`Error fetching skip=${skip + i * skipBy}:`, error.message);
                return { data: { value: [] } }; // Prevent breaking the loop
            })
        );

        const responses = await Promise.all(requests);
        const allData = responses.flatMap(res => res.data.value);

        if (allData.length === 0) break;

        arrayOfBusServices.push(...allData);
        skip += skipBy * maxParallelRequests;
        console.log(`Fetched ${allData.length} records, Total: ${arrayOfBusServices.length}`);
    }

    return { arrayOfBusServices, allBusServicesCount: arrayOfBusServices.length };
}

