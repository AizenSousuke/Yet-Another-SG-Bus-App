import PrismaSingleton from "../../classes/PrismaSingleton";

const mongoose = require("mongoose");
const axios = require("axios");
const express = require("express");
const { CatchError } = require("../../util/ErrorUtil").default;
const BusServices = require("../../models/DataMall/BusServices").default;
const router = express.Router();
const config = require("config");
const auth = require("../../middleware/auth");
import prisma from "../../classes/PrismaSingleton";
// const prisma = PrismaSingleton.getPrisma();

const header = {
	Accept: "application/json",
	AccountKey: process.env.LTADataMallAPI ?? config.get("LTADataMallAPI"),
};

const getBusServices = async (skip = null) => {
	const res = await axios.get(
		"http://datamall2.mytransport.sg/ltaodataservice/BusServices",
		{ headers: header, params: { $skip: skip } }
	);
	return res.data;
};

// router.post("/update", async (req, res) => {
// 	try {
// 		// if (!req.user.IsAdmin) {
// 		// 	console.warn("Is not an admin");
// 		// 	res.status(401).json({
// 		// 		msg: "You are not allowed to access this endpoint. Please login as admin.",
// 		// 	});
// 		// }

// 		let anyMoreDataToParse = true;
// 		let skip = 0;
// 		let skipBy = 500;
// 		while (anyMoreDataToParse) {
// 			console.log("Getting bus routes at skip: " + skip);
// 			await getBusServices(skip).then(async (data) => {
// 				// Save the routes to mongo and contra them
// 				const session = await mongoose.startSession();
// 				try {
// 					session.startTransaction();
// 					console.log("Length of transaction: " + data.value.length);

// 					// If there are no more data, break out
// 					if (data.value.length == 0) {
// 						anyMoreDataToParse = false;
// 						console.log("Finish getting data at skip: " + skip);
// 					}

// 					for (const service of data.value) {
// 						// Only update\add if there are missing items
// 						await BusServices.findOneAndUpdate(
// 							{
// 								ServiceNo: service.ServiceNo,
// 								Operator: service.Operator,
// 								Direction: service.Direction,
// 								OriginCode: service.OriginCode,
// 								DestinationCode: service.DestinationCode,
// 							},
// 							{
// 								ServiceNo: service.ServiceNo,
// 								Operator: service.Operator,
// 								Direction: service.Direction,
// 								Category: service.Category,
// 								OriginCode: service.OriginCode,
// 								DestinationCode: service.DestinationCode,
// 								AM_Peak_Freq: service.AM_Peak_Freq,
// 								AM_Offpeak_Freq: service.AM_Offpeak_Freq,
// 								PM_Peak_Freq: service.PM_Peak_Freq,
// 								PM_Offpeak_Freq: service.PM_Offpeak_Freq,
// 								LoopDesc: service.LoopDesc,
// 							},
// 							{ upsert: true }
// 						).session(session);
// 					}

// 					await session.commitTransaction();
// 					await session.endSession();

// 					skip += skipBy;
// 				} catch (err) {
// 					await session.abortTransaction();
// 					await session.endSession();
// 					CatchError(err, res);
// 				}
// 			});
// 		}

// 		return res.status(200).json({
// 			msg: "Successfully updated bus services",
// 		});
// 	} catch (error) {
// 		CatchError(error, res);
// 	}
// });

router.get("/", async (req, res) => {
	try {
		const services = await prisma.busService.findMany({});
		if (!services) {
			return res.status(404).json({ msg: "No bus services found" });
		}

		return res.status(200).json({ services: services });
	} catch (error) {
		CatchError(error, res);
	}
});

export default router;
