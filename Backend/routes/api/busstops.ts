import express from "express";
const router = express.Router();
import { check, validationResult } from "express-validator";
import axios from "axios";
import config from "config";
import PrismaSingleton from "../../classes/PrismaSingleton";
const prisma = PrismaSingleton.getPrisma();

const header = {
	Accept: "application/json",
	AccountKey: process.env.LTADataMallAPI ?? config.get("LTADataMallAPI"),
};

const getBusStopDetails = async (stop) => {
	const res = await axios.get(
		"http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2",
		{ headers: header, params: { BusStopCode: stop } }
	);
	return res.data;
};

router.get("/", async (req, res) => {
	try {
		let code = req.query.code.toString();
		if (!code) {
			return res.status(422).json({ msg: "Please add a query for code" });
		}

		let busStop;
		busStop = await prisma.busStop.findFirst({ where: { busStopCode: code } });
		if (busStop == null) {
			return res
				.status(404)
				.json({ msg: "No bus stop with that code found" });
		}

		return res.status(200).json({ busStop: busStop });
	} catch (error) {
		console.error(error.message);
		return res.status(500).send("Server error");
	}
});

router.get("/search", async (req, res) => {
	try {
		if (!req.query.term) {
			return res
				.status(422)
				.json({ msg: "Must include a term parameter" });
		}

		let term = req.query.term.toString();
		if (!term) {
			return res
				.status(422)
				.json({ msg: "Must include a term parameter" });
		}

		const busStops = await prisma.busStop.findRaw({
			filter: {
				description: { $regex: term, $options: "i" },
				roadName: { $regex: term, $options: "i" },
				busStopCode: { $regex: term, $options: "i" }
			}
		});

		if (busStops) {
			return res.status(200).json({
				msg: `Successfully searched and found ${busStops.length} bus stops`,
				details: busStops,
			});
		}

		return res
			.status(404)
			.json({ msg: "No bus stops found", details: null });
	} catch (error) {
		console.error(error.message);
		return res.status(500).json({ msg: "Server Error" });
	}
});

router.get("/nearest", async (req, res) => {
	try {
		if (!req.query.latitude || !req.query.longitude) {
			return res
				.status(422)
				.json({ msg: "Must provide both latitude and longitude" });
		}

		console.log("Longitude: " + req.query.longitude);
		console.log("Latitude: " + req.query.latitude);
		console.log("Max Distance: " + req.query.maxDistance);

		// Search for bus stops nearby
		// Reference: https://docs.mongodb.com/manual/reference/operator/query/near/#mongodb-query-op.-near
		// TODO: Fix issues
		// const busStopsNearby = await prisma.$runCommandRaw({
		// 	filter: {
		// 		location: {
		// 			$near: {
		// 				$geometry: {
		// 					type: "Point",
		// 					coordinates: [req.query.longitude, req.query.latitude],
		// 				},
		// 				$minDistance: 0,
		// 				$maxDistance: req.query.maxDistance
		// 					? req.query.maxDistance
		// 					: config.MAX_DISTANCE_IN_METRES,
		// 			},
		// 		},
		// 	}
		// });
		await prisma.$runCommandRaw({
			createIndexes: "BusStop", // Collection name
			indexes: [
				{
					key: { location: "2dsphere" }, // location is the field where the 2D sphere index will be created
					name: "location_2dsphere" // The name of the index
				}
			]
		});
		
		const longitude = parseFloat(req.query.longitude.toString());
		const latitude = parseFloat(req.query.latitude.toString());
		
		if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
		  return res.status(422).json({ msg: "Invalid coordinates" });
		}
		
		// Proceed with the $geoNear query
		const busStopsNearby = await prisma.$runCommandRaw({
		  aggregate: "BusStop",  // The collection name
		  pipeline: [
			{
			  $geoNear: {
				near: {
				  type: "Point",
				  coordinates: [longitude, latitude],  // Correct order [longitude, latitude]
				},
				distanceField: "distance",
				maxDistance: req.query.maxDistance
				  ? parseFloat(req.query.maxDistance.toString())
				  : config.MAX_DISTANCE_IN_METRES,
				spherical: true,
			  },
			},
		  ],
		  cursor: {},
		});

		// Nearest bus stop is the first one in the list
		if (busStopsNearby) {
			return res.status(200).json({ busStopsNearby: busStopsNearby });
		}
		return res.status(404).json({ msg: "No bus stops nearby" });
	} catch (error) {
		console.error(error.message);
		return res.status(500).json({ msg: "Server Error" });
	}
});

router.get("/:code", async (req, res) => {
	try {
		const code = req.params.code;
		if (!code) {
			return res.status(422).json({ msg: "No bus stop code provided" });
		}

		const details = await getBusStopDetails(code);

		return res.status(200).json({ data: details });
	} catch (error) {
		console.error(error.message);
		return res.status(500).json({ msg: "Server Error" });
	}
});

router.post(
	"/",
	[
		// Validators
		check("BusStopCode", "Bus Stop Code is required").not().isEmpty(),
		check("RoadName", "Road Name is required").not().isEmpty(),
		check("Description", "Description is required").not().isEmpty(),
		check("Longitude", "Longitude is required").not().isEmpty(),
		check("Latitude", "Latitude is required").not().isEmpty(),
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			BusStopCode,
			RoadName,
			Description,
			Longitude = 0,
			Latitude = 0,
		} = req.body;

		try {
			const busStop = await prisma.busStop.findFirst(
				{
					where: {
						busStopCode: BusStopCode,
					}
				});

			if (busStop) {
				return res.status(400).json({
					errors: [
						{
							msg: "Bus Stop already exists",
							busStopCode: BusStopCode,
						},
					],
				});
			}

			let newBusStop = await prisma.busStop.create(
				{
					data: {
						busStopCode: BusStopCode,
						roadName: RoadName,
						description: Description,
						location: {
							Longitude,
							Latitude
						},
					}
				});

			res.status(200).json({ msg: "Created Bus Stop", busStop: newBusStop });
		} catch (error) {
			console.error(error.message);
			return res.status(500).json({ msg: "Server Error" });
		}
	}
);

// Export the module to be used in the main server js
export default router;
