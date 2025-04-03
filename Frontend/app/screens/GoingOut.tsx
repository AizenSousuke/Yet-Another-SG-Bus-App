import React from "react";
import { RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import BusStopSaved from "../components/BusStopSaved";
import { useSelector } from "react-redux";

const GoingOut = (props: any) => {
	const isLoading = useSelector(state => state.home.isLoading);
	const goingOut = useSelector(state => state.busStop.goingOut);
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
			{Object.keys(goingOut).map((key, index) => {
				// const savedBusStopBuses: ISavedBusStopBuses = storeState.busStop.goingOut[Number(key)];
				return (
					<BusStopSaved
						key={index}
						code={key}
						GoingOut={true}
						settingsUpdaterFunc={() => props.updateSettings()}
					/>
				);
			})}
		</ScrollView>
	);
};

export default GoingOut;
