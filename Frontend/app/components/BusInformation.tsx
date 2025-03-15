import React, { useState, useEffect } from "react";
import { FlatList, ScrollView, View } from "react-native";
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
			<Card containerStyle={{ flexShrink: 1, marginBottom: 10 }}>
				<FlatList 
					data={selectedIndex === 1 ? route : []}
					keyExtractor={(item, index) => index.toString()}
					ListHeaderComponent={
					selectedIndex === 0 ? (
						<>
						<Card.Title>Information</Card.Title>
						<Card.Divider width={1} />
						<Table information={information} />
						</>
					) : (
						<>
						<Card.Title testID="RoutePage">Route</Card.Title>
						<Card.Divider width={1} />
						</>
					)
					}
					renderItem={({ item, index }) => (
						<>
							<ListItem.Accordion
								key={index}
								content={
								<ListItem.Content style={{ backgroundColor: "firebrick", padding: 10, borderRadius: 5 }}>
									<ListItem.Title style={{ color: "white", fontSize: 12 }}>
									{(item.busStop ? item.busStop.description : "No description") + " (" + item.busStopCode + ")"}
									</ListItem.Title>
								</ListItem.Content>
								}
								isExpanded={expanded === index}
								// noIcon
								onPress={() => setExpanded(expanded === index ? null : index)}
							>
								<ListItem containerStyle={{ marginVertical: 0, paddingVertical: 0 }}>
									<ListItem.Content>
										{/* Creating empty spaces */}
										{/* <Text>{item.busStop.description}</Text> */}
									</ListItem.Content>
								</ListItem>
							</ListItem.Accordion>
						</>
					)}
				/>
			</Card>
		</SafeAreaView>
	);
};

export default BusInformation;
