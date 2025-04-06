import { useEffect } from "react";
import { Pressable, View, Text } from "react-native";
import { Overlay } from "react-native-elements";

interface ITrackingOverlay {
	trackingVisible: boolean;
	setTrackingVisible: Function;
}

const TrackingOverlay = ({
	trackingVisible,
	setTrackingVisible,
}: ITrackingOverlay) => {
	useEffect(() => {
		console.log(`TrackingOverlay mounted`);
	}, []);

	return (
		<Pressable android_ripple={{ borderless: true }}>
			<Overlay
				isVisible={trackingVisible}
				onBackdropPress={() => setTrackingVisible(false)}
				animationType="fade"
			>
				<View>
					<Text>Tracking</Text>
				</View>
			</Overlay>
		</Pressable>
	);
};

export default TrackingOverlay;
