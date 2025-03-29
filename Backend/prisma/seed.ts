/**
 * Prisma seed file
 * 
 * TODO: Use axios to get data from LTA Data Mall and populate the database accordingly
 */

import PrismaSingleton from "../classes/PrismaSingleton";
import { getPromisesForAllBusStopsFromLTADataMallAPI } from "../routes/api/admin";
import { getPromisesForAllBusRoutesFromLTADataMallAPI } from "../routes/api/busroutes";

(async () => {
    // Using prisma.$transaction to do all db operations in 1 call
    console.log("Seeding data in MongoDB");
    const prisma = PrismaSingleton.getPrisma();

    console.log("Starting transaction");

    await prisma.$transaction(async transaction => {
        let { arrayOfBusStops } = await getPromisesForAllBusStopsFromLTADataMallAPI(null);
        let { arrayOfBusRoutes } = await getPromisesForAllBusRoutesFromLTADataMallAPI(null);

        console.log("Transaction started");
        // const response = await processInBatches(mergedArray, 1);

        console.log("All promises has ran");

        await transaction.busStop.deleteMany({});
        await transaction.busRoute.deleteMany({});

        // Prepare the data for `createMany`
        const busStopsData = arrayOfBusStops.map((busStop) => ({
            busStopCode: busStop.BusStopCode,
            location: {
                type: "Point",
                coordinates: [busStop.Longitude, busStop.Latitude] // Ensure correct order: [longitude, latitude]
            },
            description: busStop.Description,
            roadName: busStop.RoadName
        }));

        // Note: Not persisted in DB. Need to use mongosh
        //  yasgbadocker> db.BusStop.createIndex({ location: "2dsphere" }, { name: "location_2dsphere" })
        await prisma.$runCommandRaw({
            createIndexes: "busStop",
            indexes: [
                {
                    key: { location: "2dsphere" },
                    name: "location_2dsphere"
                }
            ]
        });

        const busRoutesData = arrayOfBusRoutes.map((busRoutes) => ({
            serviceNo: busRoutes.ServiceNo,
            operator: busRoutes.Operator,
            direction: busRoutes.Direction,
            stopSequence: busRoutes.StopSequence,
            busStopCode: busRoutes.BusStopCode,
            distance: busRoutes.Distance,
            wd_firstBus: busRoutes.WD_FirstBus,
            wd_lastBus: busRoutes.WD_LastBus,
            sat_firstBus: busRoutes.SAT_FirstBus,
            sat_lastBus: busRoutes.SAT_LastBus,
            sun_firstBus: busRoutes.SUN_FirstBus,
            sun_lastBus: busRoutes.SUN_LastBus
        }));

        // Use createMany to insert the bus stops in bulk
        await transaction.busStop.createMany({
            data: busStopsData
        });

        await transaction.busRoute.createMany({
            data: busRoutesData
        });

        console.log("Seeding completed");
    }, {
        // In ms
        timeout: 1000 * 60 * 10
    });
})();