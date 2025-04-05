import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { Icon, ListItem, Overlay } from "react-native-elements";
import {
	GetBusStop,
	GetBusStopByCode,
} from "../api/api";
import { Pressable } from "react-native";
import BusStop from "./BusStop";
import AppStyles from "../../assets/css/AppStyles";
import ColourScheme from "../settings/colourScheme.json";
import OptionsOverlay from "./OptionsOverlay";

/**
 * Component that is used for Home\Going out page
 */
const BusStopSaved = ({ code, GoingOut }: { code: any; GoingOut: boolean }) => {
	const [busStop, setBusStop] = useState(null);
	const [busStopData, setBusStopData] = useState(null);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [arrow, setArrow] = useState(false);
	const [overlayVisible, setOverlayVisible] = useState(false);
	const [trackingVisible, setTrackingVisible] = useState(false);

	useEffect(() => {
		console.log("Getting data for " + code);
		(async () => await getBusStopData())();
	}, [code]);

	const getBusStopData = async () => {
		GetBusStopByCode(code)
			.then((res) => {
				// console.log("GetBusStopByCode: " + JSON.stringify(res.busStop));
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
				{trackingVisible ? (
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
				) : (
					<></>
				)}
				{isCollapsed ? (
					<OptionsOverlay
						overlayVisible={overlayVisible}
						setOverlayVisible={setOverlayVisible}
						setTrackingVisible={setTrackingVisible}
						GoingOut={GoingOut}
						code={code}
					/>
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
					<Text style={AppStyles.busStopNoData}>No Data</Text>
				)}
			</Collapsible>
		</View>
	);
};

export default BusStopSaved;
