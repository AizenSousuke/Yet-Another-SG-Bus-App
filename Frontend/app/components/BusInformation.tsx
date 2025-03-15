import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import {
	Button,
	ButtonGroup,
	Card,
	Header,
	Icon,
	ListItem,
	Text,
} from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import AppStyles from "../../assets/css/AppStyles";
import ColourScheme from "../settings/colourScheme.json";
import { GetBusRouteDataWithBusStopCode, GetBusRouteData } from "../api/api";
import Table from "./Table";

/**
 * Information and Route
 */
const BusInformation = ({
	busNumber,
	busStopCode,
}: {
	busNumber: string;
	busStopCode: string;
}) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [information, setInformation] = useState([{}]);
	const [route, setRoute] = useState([{}]);
	const [expanded, setExpanded] = useState(null);

	useEffect(() => {
		(async () => {
			await updatePageData(selectedIndex);
		})();
	}, []);

	const updatePageData = async (index: number) => {
		var data = null;
		setSelectedIndex(index);
		switch (index) {
			case 1:
				// Bus Routes
				console.log("Getting bus route data for bus number", busNumber);
				data = await GetBusRouteData(busNumber);
				// console.log("Route data: " + JSON.stringify(data));
				if (data) {
					setRoute(data.routes);
				}
				break;

			default:
				// Bus Data
				console.log(
					"Getting bus data for bus number",
					busNumber,
					"and bus stop code",
					busStopCode
				);
				data = await GetBusRouteDataWithBusStopCode(busNumber, busStopCode);
				// console.log("Bus data: " + JSON.stringify(data));
				if (data) {
					setInformation(data.routes);
				}
				break;
		}
	};

	return (
		<SafeAreaView>
			<Header
				centerComponent={
					<Text style={AppStyles.busRouteNumber}>
						Bus {busNumber}
					</Text>
				}
				backgroundColor={ColourScheme.header}
			/>
			<ButtonGroup
				containerStyle={{ marginBottom: 0 }}
				selectedButtonStyle={AppStyles.buttonGroupStyle}
				selectedIndex={selectedIndex}
				buttons={[<Button title={"Information"} testID={"InformationButton"} />, <Button title={"Route"} testID={"RouteButton"} />]}
				onPress={(index) => {
					console.log("Button group pressed: " + index);
					updatePageData(index);
				}}
			/>
			<ScrollView style={{ flexGrow: 0, height: 300 }}>
				{selectedIndex === 0 && (
					<Card containerStyle={{flexShrink: 1}}>
						<Card.Title>Information</Card.Title>
						<Card.Divider width={1} />
						{/* <Text>{JSON.stringify(information)}</Text> */}
						<Table information={information} />
					</Card>
				)}
				{selectedIndex === 1 && (
					<Card containerStyle={{flexShrink: 1}}>
						<Card.Title testID="RoutePage">Route</Card.Title>
						<Card.Divider width={1} />
						{route.map((r, index) => {
							return (
								<View key={index}>
									<ListItem.Accordion
										content={
											<ListItem.Content
												style={{
													backgroundColor:
														"firebrick",
													padding: 10,
													borderRadius: 5,
												}}
											>
												<ListItem.Title
													style={{
														color: "white",
														fontSize: 12,
													}}
												>
													{(r.busStop != null ? r.busStop.description
														: "No description") +
														" (" +
														r.busStopCode +
														")"}

														{/* {JSON.stringify(r)} */}
												</ListItem.Title>
											</ListItem.Content>
										}
										isExpanded={expanded == index}
										noIcon
										onPress={() => {
											setExpanded(
												expanded == index ? null : index
											);
										}}
									>
										<ListItem>
											<ListItem.Content>
												<Text>Expanded</Text>
											</ListItem.Content>
										</ListItem>
									</ListItem.Accordion>

									{index != route.length - 1 ? (
										<Icon
											name="caret-down"
											type="font-awesome"
										/>
									) : (
										<></>
									)}
								</View>
							);
						})}
					</Card>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

export default BusInformation;
