import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	ToastAndroid,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as API from "../api/api";
import BusStopListPureComponent from "../components/BusStopListPureComponent";

export const LocationModal = () => {
	const [location, setLocation] = useState({
		latitude: 1.3,
		longitude: 103.7,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});
	const [nearbyBusStops, setNearbyBusStops] = useState([]);
	const [refreshing, setRefreshing] = useState(false);

	const mapRef = useRef(null);
	const markerRef = useRef([]);

	useEffect(() => {
		(async () => {
			await GetLocationAndUpdate();
		})();
	}, []);

	const GetLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			ToastAndroid.show("Unable to access location", ToastAndroid.SHORT);
			return;
		}

		const region = await Location.getCurrentPositionAsync({}).then(
			(loc) => {
				setLocation({
					latitude: loc.coords?.latitude,
					longitude: loc.coords?.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				});
				mapRef.current?.animateToRegion({
					latitude: loc.coords?.latitude,
					longitude: loc.coords?.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				});

				return {
					latitude: loc.coords?.latitude,
					longitude: loc.coords?.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				};
			}
		);
		return region;
	};

	const GetLocationAndUpdate = async () => {
		await GetLocation().then(async (loc) => {
			if (loc) {
				// Get nearby bus stops
				const stops = await API.GetNearbyBusStop(
					loc.longitude,
					loc.latitude
				);

				// console.log(stops.busStopsNearby[0]);
				// console.log(JSON.stringify(stops));

				if (stops.busStopsNearby) {
					setNearbyBusStops(stops.busStopsNearby);
				}
			}
		});
	};

	const mapStyles = StyleSheet.create({
		container: {
			flex: 1,
		},
		map: {
			height: 250,
			width: 400,
		},
	});

	return (
		<SafeAreaView edges={[]} style={mapStyles.container}>
			{location ? (
				<MapView
					ref={mapRef}
					provider={PROVIDER_GOOGLE}
					style={mapStyles.map}
					region={location}
					showsUserLocation={true}
					maxZoomLevel={17}
				>
					{nearbyBusStops &&
						nearbyBusStops.length > 0 &&
						nearbyBusStops.map((marker: any, index: number) => (
							<Marker
								key={index}
								identifier={marker.description}
								ref={(elem) =>
									(markerRef.current[marker.busStopCode] =
										elem)
								}
								title={marker.Description}
								coordinate={{
									longitude: marker.location.coordinates[0],
									latitude: marker.location.coordinates[1],
								}}
							/>
						))}
				</MapView>
			) : (
				<Text>No map loaded.</Text>
			)}
			<FlatList
				keyExtractor={(item, index) => index.toString()}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => {
							GetLocationAndUpdate()
								.then(() => {
									ToastAndroid.show(
										"Updated",
										ToastAndroid.SHORT
									);
									setRefreshing(false);
								})
								.catch((error) => {
									ToastAndroid.show(
										error,
										ToastAndroid.SHORT
									);
									setRefreshing(false);
								});
						}}
					></RefreshControl>
				}
				data={nearbyBusStops}
				renderItem={({ item }: { item: any }) => (
					<BusStopListPureComponent
						name={item.description}
						address={item.roadName}
						code={item.busStopCode}
						CollapseEvent={() => {
							mapRef.current?.fitToSuppliedMarkers([
								item.description,
							]);
							markerRef.current[item.busStopCode].showCallout();
						}}
					/>
				)}
				ListEmptyComponent={
					<Text style={{ textAlign: "center" }}>
						There are no bus stops nearby. Please set the location
						in the map and swipe down to refresh the list.
					</Text>
				}
			/>
		</SafeAreaView>
	);
};

export default LocationModal;
