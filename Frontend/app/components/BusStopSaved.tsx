import React, { useState, useEffect } from "react";
import { Text, ToastAndroid, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { Icon, ListItem, Overlay } from "react-native-elements";
import {
	GetBusStop,
	GetBusStopByCode,
	RemoveCodeFromSettings,
} from "../api/api";
import { Pressable } from "react-native";
import BusStop from "./BusStop";
import AuthConsumer from "../context/AuthContext";
import AppStyles from "../../assets/css/AppStyles";
import ColourScheme from "../settings/colourScheme.json";
import { store } from "../redux/store";
import { removeBusStopBus } from "../redux/features/busStops/busStopsSlice";
import { Direction } from "../classes/Enums";

const BusStopSaved = ({ code, GoingOut, settingsUpdaterFunc }: { code: any; GoingOut: boolean, settingsUpdaterFunc: Function }) => {
	const [busStop, setBusStop] = useState(null);
	const [busStopData, setBusStopData] = useState(null);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [arrow, setArrow] = useState(false);
	const [overlayVisible, setOverlayVisible] = useState(false);

	useEffect(() => {
		console.log("Getting data for " + code);
		(async () => await getBusStopData())();
	}, [code]);

	const getBusStopData = async () => {
		GetBusStopByCode(code)
			.then((res) => {
				console.warn("GetBusStopByCode: " + JSON.stringify(res.busStop));
				setBusStop(res.busStop);
			})
			.catch((error) => console.error(error));
		GetBusStop(code)
			.then((res) => {
				// console.log("GetBusStop: " + JSON.stringify(res.data));
				setBusStopData(res.data);
			})
			.catch((error) => console.error(error));
	};

	return (
		<View>
			<ListItem
				containerStyle={{ backgroundColor: ColourScheme.primary }}
				topDivider
				bottomDivider
				onPress={() => {
					setIsCollapsed(!isCollapsed);
					setArrow(!arrow);
				}}
			>
				<Icon
					name={
						arrow ? "keyboard-arrow-down" : "keyboard-arrow-right"
					}
				/>
				<ListItem.Content>
					<ListItem.Title>
						<Text style={AppStyles.busStopName}>
							{busStop
								? busStop.description
								: "No Bus Stop Name provided"}
						</Text>
					</ListItem.Title>
					<ListItem.Subtitle>
						<Text style={AppStyles.busStopRoadName}>
							{busStop ? busStop.roadName : "No Address provided"}{" "}
							({code ?? "No Bus Stop Code provided"})
						</Text>
					</ListItem.Subtitle>
				</ListItem.Content>
				{isCollapsed ? (
					<Pressable
						onPress={() => setOverlayVisible(!overlayVisible)}
						android_ripple={{ borderless: true }}
					>
						<View>
							<Icon name="more-vert" />
							<Overlay
								isVisible={overlayVisible}
								onBackdropPress={() =>
									setOverlayVisible(!overlayVisible)
								}
							>
								<AuthConsumer>
									{(auth) => {
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
														
														store.dispatch(removeBusStopBus({
															direction: GoingOut ? Direction.GoingOut : Direction.GoingHome,
															busStopCode: code
														}));

														await RemoveCodeFromSettings(
															auth.token,
															code,
															GoingOut
														)
															.then(async (res) => {
																// Refresh state
																await settingsUpdaterFunc();
															})
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
								</AuthConsumer>
							</Overlay>
						</View>
					</Pressable>
				) : (
					<Pressable
						onPress={() => {
							console.log("Refreshing bus stop " + code);
							getBusStopData();
						}}
						android_ripple={{ borderless: true }}
					>
						<View>
							<Icon name="refresh" />
						</View>
					</Pressable>
				)}
			</ListItem>
			<Collapsible collapsed={isCollapsed}>
				{busStopData != null ? (
					<BusStop busStopData={busStopData} />
				) : (
					<Text>No Data</Text>
				)}
			</Collapsible>
		</View>
	);
};

export default BusStopSaved;
