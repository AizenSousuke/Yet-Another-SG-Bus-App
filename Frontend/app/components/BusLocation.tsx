import React, { useState, useEffect } from "react";
import { Header, Image, Text } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import ColourScheme from "../settings/colourScheme.json";

/**
 * Map view of the bus
 */
const BusLocation = ({
	busNumber,
	nextBus,
	busStopLocation,
}: {
	busNumber: string;
	nextBus: any;
	busStopLocation: any;
}) => {
	const [busRegion, setBusRegion] = useState({
		latitude: nextBus !== null ? parseFloat(nextBus.Latitude) : 1,
		longitude: nextBus !== null ? parseFloat(nextBus.Longitude) : 100,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});

	const map = React.createRef<MapView>();

	useEffect(() => {
		(async () => {})();
		setTimeout(() => {
			// Animate to bus stop location if possible
			if (busStopLocation && map) {
				// console.log(JSON.stringify(busStopLocation));
				map?.current?.animateToRegion(
					{
						latitude: busStopLocation.Location[1],
						longitude: busStopLocation.Location[0],
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					},
					1000
				);
			}
		}, 2000);
	}, []);

	return (
		<SafeAreaView>
			<Header
				backgroundColor={ColourScheme.header}
				centerComponent={
					<Text
						style={{
							color: "white",
							fontWeight: "bold",
							fontSize: 18,
						}}
					>
						Oi, where is Bus {busNumber} leh?
					</Text>
				}
			></Header>
			{busRegion.latitude == 0 && busRegion.longitude == 0 ? (
				<Text style={{ alignSelf: "center" }}>
					No data found from LTA's API. Complain to them ok?
				</Text>
			) : (
				<MapView
					provider={PROVIDER_GOOGLE}
					style={{
						height: 250,
						width: 400,
					}}
					region={busRegion}
					ref={map}
				>
					<Marker coordinate={busRegion}>
						<Image
							source={require("../../assets/bus.png")}
							style={{ height: 30, width: 30, tintColor: "red" }}
							height={30}
							width={30}
						/>
					</Marker>
					<Marker
						coordinate={{
							latitude: busStopLocation
								? busStopLocation.Location?.length > 0
									? busStopLocation.Location[1] ?? 0
									: 0
								: 0,
							longitude: busStopLocation
								? busStopLocation.Location?.length > 0
									? busStopLocation.Location[0] ?? 0
									: 0
								: 0,
						}}
					>
						<Image
							source={require("../../assets/person.png")}
							style={{ height: 30, width: 30, tintColor: "red" }}
							height={30}
							width={30}
						/>
					</Marker>
				</MapView>
			)}
		</SafeAreaView>
	);
};

export default BusLocation;
