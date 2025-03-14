import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import BusDetails from "./BusDetails";
import AppStyles from "../../assets/css/AppStyles";
import { GetBusStopByCode } from "../api/api";

/**
 * Bus Stop and Bus Services view
 */
const BusStop = ({ busStopData }: { busStopData: any }) => {
	const [busStopLocation, setBusStopLocation] = useState({ Location: [] });

	useEffect(() => {
		(async () => {
			GetBusStopByCode(busStopData?.BusStopCode).then((result) => {
				setBusStopLocation({ Location: result.busStop?.Location });
			});
		})();
	}, []);

	return (
		<View style={AppStyles.busStop}>
			{busStopData != null ? (
				busStopData.Services?.sort((a: any) => a.ServiceNo).map(
					(service: any, key: number) => {
						return (
							<BusDetails
								key={key}
								busNumber={service.ServiceNo}
								details={service}
								busStopData={busStopData}
								busStopLocation={busStopLocation}
							/>
						);
					}
				)
			) : (
				<Text>No bus stop data found from LTA's API</Text>
			)}
		</View>
	);
};

export default BusStop;
