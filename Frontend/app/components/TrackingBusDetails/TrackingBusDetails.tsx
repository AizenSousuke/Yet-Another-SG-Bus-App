import { useEffect } from "react";
import { View, Text } from "react-native";
import { Switch } from "react-native-elements";
import ColorScheme from "../../settings/colourScheme.json";

interface ITrackingBusDetails {
	isTracked: boolean;
}

const TrackingBusDetails = ({ isTracked = true }: ITrackingBusDetails) => {
	useEffect(() => {
		console.log(`TrackingBusDetails mounted`);
	}, []);

	return (
		<View
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				minWidth: "70%",
				borderBottomColor: "black",
				borderBottomWidth: 0.2,
			}}
		>
			<Text style={{ flex: 2, marginHorizontal: 10 }}>Bus Number</Text>
			<Text style={{ flex: 4, marginHorizontal: 10 }}>Bus Stop Name</Text>
			<Switch
				style={{ flex: 1, marginLeft: 10 }}
				color={ColorScheme.header}
				value={isTracked}
			/>
		</View>
	);
};

export default TrackingBusDetails;
