import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { ToastAndroid, View } from "react-native";
import { Header } from "react-native-elements";
import { LogOut } from "../api/api";
import SearchButton from "./SearchButton";
import TabNavigator from "./TabNavigator";
import AuthConsumer from "../context/AuthContext";
import { CheckTokenExpiry } from "../api/api";
import LocationButton from "./LocationButton";
import ColourScheme from "../settings/colourScheme.json";
import Constants from "expo-constants";
import { persistedStore, store } from "../redux/store";
import { signIn } from "../redux/features/homePage/homePageSlice";
import { useSelector } from "react-redux";
import { resetStore } from "../redux/reducers/rootReducer";

export const Home = ({ navigation }: { navigation: any }) => {
	const isLoggedIn = useSelector((state: any) => state.home.isLoggedIn);
	return (
		<View style={{ flex: 1 }}>
			<AuthConsumer>
				{(auth) => {
					return (
						<Header
							backgroundColor={ColourScheme.header}
							placement={"center"}
							leftComponent={{
								icon: "logout",
								color: "white",
								onPress: async () => {
									await auth.updateToken();

									await LogOut().then(async (res) => {
										// store.dispatch(loggedIn(false));
										store.dispatch(resetStore());
										await persistedStore.purge();
										console.log("Successfully purged persistedStore");
										console.log("Logged out");
									});
								},
							}}
							centerComponent={{
								text:
									process.env.NODE_ENV === "production"
										? "Yet Another SG Bus App"
										: "Yet Another SG Bus App (Dev)",
								style: {
									color:
										process.env.NODE_ENV === "production"
											? "white"
											: "lightgreen",
									fontSize: 18,
								},
								testID: "header",
							}}
							rightComponent={{
								icon: isLoggedIn ? "person" : "login",
								// icon: auth.token ? "person" : "login",
								color: "white",
								onPress: async () => {
									// let result = await AsyncStorage.getItem(
									// 	process.env.TOKEN ??
									// 		Constants?.expoConfig?.extra?.TOKEN
									// );

									// Get token from the store 
									let result = store.getState().home.token;

									console.log(
										"Token Result: " + JSON.stringify(result)
									);

									// Check if the token has expired on the server end
									const tokenExpiry = await CheckTokenExpiry(
										result
									).catch((error) => {
										ToastAndroid.show(
											"Error: " + error,
											ToastAndroid.SHORT
										);

										return null;
									});

									if (
										!result ||
										tokenExpiry?.expired == true
									) {
										// Sign in and Get new token
										console.log("Signing in and getting new token");
										store.dispatch(signIn());
									} else {
										ToastAndroid.show(
											"You have already logged in",
											1000
										);
									}
								},
							}}
						/>
					);
				}}
			</AuthConsumer>
			<TabNavigator />
			<LocationButton
				onPress={() => {
					navigation.navigate("Location");
				}}
			/>
			<SearchButton
				onPress={() => {
					navigation.navigate("Search");
				}}
			/>
		</View>
	);
};

export default Home;
