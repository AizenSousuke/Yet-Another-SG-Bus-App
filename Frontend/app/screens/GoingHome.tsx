import React from "react";
import { RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import BusStopSaved from "../components/BusStopSaved";
import { useSelector } from "react-redux";

const GoingHome = (props: any) => {
	const isLoading = useSelector(state => state.home.isLoading);
	const goingHome = useSelector(state => state.busStop.goingHome);
	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={isLoading}
					onRefresh={() => {
						console.log("Refreshing");
						props.updateSettings();
					}}
				></RefreshControl>
			}
		>
			{Object.keys(goingHome).map((key, index) => {
				// const savedBusStopBuses: ISavedBusStopBuses = storeState.busStop.goingHome[Number(key)];
				return (
					<BusStopSaved
						key={index}
						code={key}
						GoingOut={false}
						settingsUpdaterFunc={() => props.updateSettings()}
					/>
				);
			})}
		</ScrollView>
	);
};

export default GoingHome;
