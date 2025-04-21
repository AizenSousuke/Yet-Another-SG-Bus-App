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
	busDetailsData: ITrackingBusDetailsData[];
}

export interface ITrackingBusDetailsData {
	busStopCode: string;
	busService: string;
	isTracked: boolean;
	setTrackingForBus: (
		busStopCode: string,
		busService: string,
		tracked: boolean
	) => void;
}

const setTrackingForBus = (
	busStopCode: string,
	busService: string,
	tracked: boolean
) => {
	// TODO: Update the tracked bus state
	// Call api straight and it should update the app state when settings is refreshed
};

const TrackingOverlay = ({
	trackingVisible,
	setTrackingVisible,
	busDetailsData,
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
				overlayStyle={{ width: "80%", height: "80%", padding: 0 }}
			>
				<SafeAreaView style={{ flex: 1 }}>
					<Header
						centerComponent={
							<Text style={AppStyles.headerStyle}>Tracking</Text>
						}
						backgroundColor={ColourScheme.header}
					/>
					<Card containerStyle={{ flex: 1, margin: 0 }}>
						<Card.Title>
							Tracking these buses for this bus stop:
						</Card.Title>
						<Card.Divider />
						<View>
							<ScrollView>
								{busDetailsData.length > 0 ? (
									busDetailsData.map(
										(
											data: ITrackingBusDetailsData,
											index
										) => {
											return (
												<TrackingBusDetails
													key={index}
													busStopCode={
														data.busStopCode
													}
													busService={data.busService}
													isTracked={data.isTracked}
													setTrackingForBus={(
														busStopCode: string,
														busService: string,
														tracked: boolean
													) =>
														setTrackingForBus(
															busStopCode,
															busService,
															tracked
														)
													}
												/>
											);
										}
									)
								) : (
									<Text style={AppStyles.noData}>
										No Bus Services
									</Text>
								)}
							</ScrollView>
						</View>
					</Card>
				</SafeAreaView>
			</Overlay>
		</Pressable>
	);
};

export default TrackingOverlay;
