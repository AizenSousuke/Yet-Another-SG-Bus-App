import React, { useEffect } from "react";
import AuthConsumer from "../../context/AuthContext";
import { Pressable, View, ToastAndroid } from "react-native";
import { Icon, Overlay, ListItem } from "react-native-elements";
import { RemoveCodeFromSettings } from "../../api/api";
import { Direction } from "../../classes/Enums";
import { removeBusStopBus } from "../../redux/features/busStops/busStopsSlice";
import { store } from "../../redux/store";
import SettingsConsumer from "../../context/SettingsContext";

interface IOptionsOverlay {
	GoingOut: boolean;
	overlayVisible: any;
	setOverlayVisible: any;
	code: string;
}

const OptionsOverlay = ({
	GoingOut,
	overlayVisible,
	setOverlayVisible,
	code,
}: IOptionsOverlay) => {
	useEffect(() => {
		console.log(`OptionsOverlay mounted`);
	}, []);

	return (
		<Pressable
			onPress={() => setOverlayVisible(!overlayVisible)}
			android_ripple={{ borderless: true }}
		>
			<View>
				<Icon name="more-vert" />
				<Overlay
					isVisible={overlayVisible}
					onBackdropPress={() => setOverlayVisible(!overlayVisible)}
				>
					<AuthConsumer>
						{(auth: any) => {
							return (
								<SettingsConsumer>
									{(settings: any) => {
										return (
											<View>
												<ListItem>
													<ListItem.Title>
														What do you want to do?
													</ListItem.Title>
												</ListItem>
												<ListItem
													onPress={async () => {
														setOverlayVisible(
															!overlayVisible
														);

														store.dispatch(
															removeBusStopBus({
																direction:
																	GoingOut
																		? Direction.GoingOut
																		: Direction.GoingHome,
																busStopCode:
																	code,
															})
														);

														await RemoveCodeFromSettings(
															auth.token,
															code,
															GoingOut
														)
															.then(
																async (res) => {
																	ToastAndroid.show(
																		res.msg,
																		ToastAndroid.SHORT
																	);
																}
															)
															.catch((error) => {
																ToastAndroid.show(
																	error,
																	ToastAndroid.SHORT
																);
															});
													}}
												>
													<ListItem.Subtitle>
														Delete
													</ListItem.Subtitle>
												</ListItem>
											</View>
										);
									}}
								</SettingsConsumer>
							);
						}}
					</AuthConsumer>
				</Overlay>
			</View>
		</Pressable>
	);
};

export default OptionsOverlay;
