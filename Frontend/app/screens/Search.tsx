import React, { useEffect, useState, useRef } from "react";
import {
	FlatList,
	ToastAndroid,
	ActivityIndicator,
	View,
	Text,
	ViewabilityConfig,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { SearchBusStop } from "../api/api";
import BusStopListPureComponent from "../components/BusStopListPureComponent";
import Constants from "expo-constants";

const options = {
	keys: ["busStopCode", "roadName"],
	minMatchCharLength: 4,
};

const renderItem = ({ item }) => (
	<BusStopListPureComponent
		name={item.description}
		address={item.roadName}
		code={item.busStopCode}
	/>
);

const Search = () => {
	const [search, updateSearch] = useState("");
	const [busStops, setBusStops] = useState([]);
	const searchLength = 1;
	const limitResultsPerPage = 5;
	const [loading, setLoading] = useState(false);
	const searchBarRef = useRef();

	const searchForBusStops = async () => {
		console.log("Searching for bus stops");
		console.log(
			"Constants expoConfig: " + JSON.stringify(Constants.expoConfig)
		);
		// Search for bus stops
		if (search.length >= searchLength) {
			ToastAndroid.show("Searching", ToastAndroid.SHORT);
			setLoading(true);

			// ToastAndroid.show("Searching " + Constants.expoConfig?.extra?.BACKEND_API, ToastAndroid.SHORT);
			// Check if there's data in the db table
			SearchBusStop(search)
				.then(
					(res) => {
						ToastAndroid.show(res.msg, ToastAndroid.SHORT);
						setBusStops(res.details);
					},
					(rej) => {
						ToastAndroid.show("Search failed", ToastAndroid.SHORT);
					}
				)
				.catch((error) => {
					console.error(error);
					ToastAndroid.show(
						"Error in SearchBusStop: " + error,
						ToastAndroid.SHORT
					);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			ToastAndroid.show(
				"Enter at least 1 character.",
				ToastAndroid.SHORT
			);
		}
	};

	const viewabilityConfig: ViewabilityConfig = {
		minimumViewTime: 1000
	};

	useEffect(() => {
		console.log("UseEffect has been executed");
		setTimeout(() => {
			searchBarRef.current?.focus();
		}, 500);
	}, []);

	return (
		<FlatList
			ListHeaderComponent={
				<SearchBar
				placeholder={"Search for a bus stop"}
				onChangeText={(value) => {
					updateSearch(value);
				}}
				onSubmitEditing={() => {
					console.log("Searching for: " + search);
					searchForBusStops();
				}}
				value={search.toString()}
				ref={searchBarRef}
				/>
			}
			windowSize={5}
			// For search bar
			stickyHeaderIndices={[0]}
			initialNumToRender={limitResultsPerPage}
			maxToRenderPerBatch={limitResultsPerPage}
			data={busStops}
			renderItem={renderItem}
			keyExtractor={(item) => item.busStopCode}
			viewabilityConfig={viewabilityConfig}
			ListEmptyComponent={
				loading ? (
					<ActivityIndicator animating={loading} size={"large"} />
				) : (
					<View></View>
				)
			}
		/>
	);
};

export default Search;
