import { useEffect } from "react";
import { Pressable, View, Text, SafeAreaView } from "react-native";
import { Card, Header, Overlay } from "react-native-elements";
import AppStyles from "../../../assets/css/AppStyles";
import TrackingBusDetails from "../TrackingBusDetails";
import ColourScheme from "../../settings/colourScheme.json";
import { ScrollView } from "react-native-gesture-handler";

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
				<SafeAreaView
					style={{ display: "flex", flex: 0.5, maxWidth: "80%" }}
				>
					<Header
						centerComponent={
							<Text style={AppStyles.headerStyle}>Tracking</Text>
						}
						backgroundColor={ColourScheme.header}
					/>
					<Card containerStyle={{ margin: 0 }}>
						<Card.Title>Tracking Buses:</Card.Title>
						<Card.Divider />
						<View style={{}}>
							<ScrollView>
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
								<TrackingBusDetails />
							</ScrollView>
						</View>
					</Card>
				</SafeAreaView>
			</Overlay>
		</Pressable>
	);
};

export default TrackingOverlay;
