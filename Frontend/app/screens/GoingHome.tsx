import React from "react";
import { RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import BusStopSaved from "../components/BusStopSaved";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const GoingHome = (props: any) => {
	const isLoading = useSelector((state: RootState) => state.home.isLoading);
	const goingHome = useSelector((state: RootState) => state.busStop.goingHome);
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
			{goingHome.map((key, index) => {
				// const savedBusStopBuses: ISavedBusStopBuses = storeState.busStop.goingHome[Number(key)];
				return (
					<BusStopSaved
						key={index}
						code={key.busStop.busStopCode}
						GoingOut={false}
						settingsUpdaterFunc={() => props.updateSettings()}
					/>
				);
			})}
		</ScrollView>
	);
};

export default GoingHome;
