import React from "react";
import { RefreshControl, View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import BusStopSaved from "../components/BusStopSaved";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const GoingOut = (props: any) => {
	const isLoading = useSelector((state: RootState) => state.home.isLoading);
	const goingOut = useSelector((state: RootState) => state.busStop.goingOut);
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
			{/* <View> */}
				{/* <Text>{JSON.stringify(goingOut.map(src => src)).toString()}</Text> */}
			{/* </View> */}
				{goingOut.map((key, index) => {
					console.log("key: " + key);
					console.log("index: " + index);
					// const savedBusStopBuses: ISavedBusStopBuses = storeState.busStop.goingOut[Number(key)];
					return (
						<BusStopSaved
							key={index}
							code={key.busStop.busStopCode}
							GoingOut={true}
							// TODO: Add the busServices here
							settingsUpdaterFunc={() => props.updateSettings()}
						/>
					);
				})}
		</ScrollView>
	);
};

export default GoingOut;
