import moment from "moment";
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import * as Progress from "react-native-progress";
import AppStyles from "../../assets/css/AppStyles";
import BusLocation from "./BusLocation";
import BusInformation from "./BusInformation";
import ModalAdder from "./common/ModalAdder";

const GetValueForLoad = (load: string) => {
	switch (load) {
		case "SEA":
			return 0.2;
		case "SDA":
			return 0.6;
		default:
			return 0.9;
	}
};

const GetColorForLoad = (load: string) => {
	switch (load) {
		case "SEA":
			return "green";
		case "SDA":
			return "orange";
		default:
			return "red";
	}
};

const GetEstimatedArrivalMinute = (estimatedArrivalTime: string) => {
	var timeNow = moment().utcOffset("+08:00").format();
	var time1 = moment(timeNow);
	var time2 = moment(estimatedArrivalTime);
	// console.log("Time now: " + timeNow);
	// console.log("Time bus is reaching: " + estimatedArrivalTime);
	var timeEstimatedArrival: number = time2.diff(time1, "minutes");
	// console.log("Time estimated arrival: " + timeEstimatedArrival);

	if (parseInt(timeEstimatedArrival.toString()) > 2) {
		return timeEstimatedArrival + " min";
	} else {
		return "Arrived";
	}
};

/**
 * Bus detail component (for arrival time)
 */
const BusDetails = ({
	busStopData,
	busNumber,
	details,
	busStopLocation,
}: {
	busStopData: any;
	busNumber: string;
	details: any;
	busStopLocation: any;
}) => {
	const [number, setNumber] = useState(busNumber);
	const [data, setData] = useState(details);

	useEffect(() => {
		setNumber(busNumber);
		setData(details);
	}, [busNumber, details]);

	return (
		<View style={AppStyles.busDetails}>
			<ModalAdder
				modalElement={
					<BusInformation
						busNumber={number}
						busStopCode={busStopData?.BusStopCode}
					/>
				}
				style={{
					flex: 0.2,
				}}
			>
				<View style={{ flexDirection: "column" }}>
					<Text style={[AppStyles.busNumber]}>{number}</Text>
				</View>
			</ModalAdder>
			<ModalAdder
				modalElement={
					<BusLocation
						busNumber={details?.ServiceNo}
						nextBus={details?.NextBus}
						busStopLocation={busStopLocation}
					/>
				}
				style={AppStyles.modal}
			>
				<View style={{ flexDirection: "column" }}>
					{data?.NextBus?.Load ? (
						<>
							<Text style={AppStyles.busType}>
								{data?.NextBus?.Type == "DD" ? "Double" : ""}
							</Text>
							<Progress.Bar
								progress={GetValueForLoad(data?.NextBus?.Load)}
								color={GetColorForLoad(data?.NextBus?.Load)}
								width={50}
							/>
							<Text style={AppStyles.estimatedArrival}>
								{GetEstimatedArrivalMinute(
									data?.NextBus?.EstimatedArrival
								).toString()}
							</Text>
						</>
					) : (
						<Text style={AppStyles.noData}>No Data</Text>
					)}
				</View>
				<View style={{ flexDirection: "column" }}>
					{data?.NextBus2?.Load ? (
						<>
							<Text style={AppStyles.busType}>
								{data?.NextBus2?.Type == "DD" ? "Double" : ""}
							</Text>
							<Progress.Bar
								progress={GetValueForLoad(data?.NextBus2?.Load)}
								color={GetColorForLoad(data?.NextBus2?.Load)}
								width={50}
							/>
							<Text style={AppStyles.estimatedArrival}>
								{GetEstimatedArrivalMinute(
									data?.NextBus2?.EstimatedArrival
								).toString()}
							</Text>
						</>
					) : (
						<Text style={AppStyles.noData}>No Data</Text>
					)}
				</View>
				<View style={{ flexDirection: "column" }}>
					{data?.NextBus3?.Load ? (
						<>
							<Text style={AppStyles.busType}>
								{data?.NextBus2?.Type == "DD" ? "Double" : ""}
							</Text>
							<Progress.Bar
								progress={GetValueForLoad(data?.NextBus3?.Load)}
								color={GetColorForLoad(data?.NextBus3?.Load)}
								width={50}
							/>
							<Text style={AppStyles.estimatedArrival}>
								{GetEstimatedArrivalMinute(
									data?.NextBus3?.EstimatedArrival
								).toString()}
							</Text>
						</>
					) : (
						<Text style={AppStyles.noData}>No Data</Text>
					)}
				</View>
			</ModalAdder>
		</View>
	);
};

export default BusDetails;
