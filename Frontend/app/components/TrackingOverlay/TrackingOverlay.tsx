import { useEffect } from "react";
import { Pressable, View, Text } from "react-native";
import { Card, Overlay } from "react-native-elements";
import AppStyles from "../../../assets/css/AppStyles";
import TrackingBusDetails from "../TrackingBusDetails";

interface ITrackingOverlay {
	trackingVisible: boolean;
	setTrackingVisible: Function;
}

const TrackingOverlay = ({
	trackingVisible,
	setTrackingVisible,
}: ITrackingOverlay) => {
	useEffect(() => {
		// console.log(`TrackingOverlay mounted`);
	}, []);

	return (
		<Pressable android_ripple={{ borderless: true }}>
			<Overlay
				isVisible={trackingVisible}
				onBackdropPress={() => setTrackingVisible(false)}
				animationType="fade"
			>
				<Card containerStyle={{ margin: 0 }}>
					<Card.Title>Tracking</Card.Title>
					<Card.Divider />
					<Text>Tracking buses:</Text>
					<View style={{ display: "flex", flexDirection: "column" }}>
						<TrackingBusDetails />
						<TrackingBusDetails />
						<TrackingBusDetails />
						<TrackingBusDetails />
					</View>
				</Card>
			</Overlay>
		</Pressable>
	);
};

export default TrackingOverlay;
