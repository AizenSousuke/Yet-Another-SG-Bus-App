import { useEffect } from "react";
import { View, Text } from "react-native";
import { Switch } from "react-native-elements";
import ColorScheme from "../../settings/colourScheme.json";
import { ITrackingBusDetailsData } from "../TrackingOverlay/TrackingOverlay";

const TrackingBusDetails = ({
	busStopCode,
	busService,
	isTracked = true,
	setTrackingForBus,
}: ITrackingBusDetailsData) => {
	useEffect(() => {
		console.log(`TrackingBusDetails mounted`);
	}, []);

	return (
		<View
			style={{
				display: "flex",
				flexDirection: "row",
				borderBottomColor: "lightgrey",
				borderBottomWidth: 0.2,
				padding: 10,
			}}
		>
			<Text style={{ flex: 2, marginHorizontal: 10, fontSize: 16 }}>
				{busService}
			</Text>
			<Text
				style={{
					flex: 3,
					marginHorizontal: 10,
					fontSize: 16,
					fontWeight: "100",
				}}
			>
				Bus Stop: {busStopCode}
			</Text>
			<Switch
				style={{ flex: 1, marginLeft: 10 }}
				color={ColorScheme.header}
				value={isTracked}
			/>
		</View>
	);
};

export default TrackingBusDetails;
