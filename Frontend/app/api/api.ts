import axios, { AxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import IHeaders from "../interfaces/IHeaders";
import AsyncStorage from "@react-native-async-storage/async-storage";
const api = process.env.BACKEND_API ?? Constants.expoConfig?.extra?.BACKEND_API;


/**
 * Data to be set for the requests
 */
var data = {
	withCredentials: true,
	crossdomain: true,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
		"X-Auth-Token": null as string | null,
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "*",
	} as IHeaders,
};

const instance = axios.create({
	baseURL: api,
	// timeout: 10000,
	headers: data.headers
});

console.log("Creating instance of axios");

export const SetInterceptorsForAxiosInstance = async () => {
	console.log("SetInterceptorsForAxiosInstance is called");
	instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
		const token = await AsyncStorage.getItem(process.env.TOKEN ?? "TOKEN");
		console.log("Token in interceptor: ", token);
		if (token) {
			config.headers['x-auth-token'] = token;
			console.warn("Setting x-auth-token");
		}

		return config;
	});
};

export const GetBusRouteDataWithBusStopCode = async (busNumber: string, busStopCode: string) => {
	const response = await instance.get(
		`/busroutes/${busNumber}/${busStopCode}`
	);
	return response.data;
};

export const GetBusRouteData = async (busNumber: string) => {
	const response = await instance.get(
		`/busroutes/${busNumber}`
	);
	return response.data;
};

export const GetBusStopList = async () => {
	const response = await instance.get(`/busstops`, data);
	return response.data;
};

export const GetBusStop = async (code: string) => {
	const response = await instance.get(`/busstops/${code}`, data);
	return response.data;
};

export const GetBusStopDetails = async (direction: string, code: string) => {
	const response = await instance.get(`/settings/busstop/details/${direction}/${code}`, data);
	return response.data;
};

export const GetBusStopByCode = async (code: string) => {
	const response = await instance.get(`/busstops?code=${code}`, data);
	return response.data;
};

export const GetNearbyBusStop = async (
	longitude: number,
	latitude: number,
	maxDistance = process.env.MAX_DISTANCE_IN_METRES ?? Constants.expoConfig?.extra?.MAX_DISTANCE_IN_METRES ?? 100
) => {
	if (!longitude || !latitude) {
		console.error("Latitude or longitude not provided");
		return {
			msg: "Please provide a longitude and latitude in the JSON body",
		};
	}
	const response = await instance
		.get(
			`/busstops/nearest?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`
		)
		.catch((error) => {
			console.error("Error in API: " + error);
			return { msg: error };
		});
	// console.log("Nearest bus stop: " + JSON.stringify(response.data));
	return response.data;
};

export const SearchBusStop = async (term: string) => {
	const response = await instance
		.get(`/busstops/search?term=${term}`, data)
		.catch((error) => {
			console.error("Error in API: " + error);
			return null;
		});
	return response.data;
};

export const GetBus = async (number: string) => {
	const response = await instance.get(`/bus?number=${number}`);
	return response.data;
};

export const GetSettings = async (token: string | null) => {
	console.log("Token is: " + token);
	data.headers["X-Auth-Token"] = token;
	console.log("Api is: " + api);
	return await instance
		.get(`/settings`, data)
		.then((res) => {
			console.log("Settings res: " + JSON.stringify(res));
			return res.data;
		})
		.catch((error) => {
			console.error("Error in API for GetSettings: " + error);
			return { msg: error.message };
		});
};

export const SaveSettings = async (token: string | null, code: string, GoingOut = true) => {
	try {
		if (!token) {
			console.error("No token provided");
			return null;
		}

		console.log("Token in SaveSettings is: " + token);
		data.headers["X-Auth-Token"] = token;
		console.log("X-Auth-Token in data is: " + JSON.stringify(data));
		const prevSettings = await instance
			.get(`/settings`, data)
			.then((response) => {
				// If there is a setting
				var settings = response.data?.settings;

				if (settings) {
					console.log(
						"Settings found: " +
						JSON.stringify(settings)
					);

					console.log("settings.settingsSchema.goingOut:" + JSON.stringify(settings.settingsSchema.goingOut));
					console.log("settings.settingsSchema.goingHome:" + JSON.stringify(settings.settingsSchema.goingHome));
					if (settings.settingsSchema.goingOut == null) {
						settings.settingsSchema.goingOut = [];
					}

					if (settings.settingsSchema.goingHome == null) {
						settings.settingsSchema.goingHome = [];
					}

					console.log("Returning from settings in DB: " + JSON.stringify(settings.settingsSchema));

					return { GoingOut: settings.settingsSchema.goingOut.map(src => src.busStop.busStopCode), GoingHome: settings.settingsSchema.goingHome.map(src => src.busStop.busStopCode) };
				} else {
					console.log("No settings. Creating new ones.");
					return { GoingOut: [], GoingHome: [] };
				}
			})
			.catch((error) => {
				console.error("Error in API for SaveSettings when getting settings. Defaulting value: " + error);
				return { GoingOut: [], GoingHome: [] };
			});

		console.log("prevSettings: " + JSON.stringify(prevSettings));
		console.log("Token is still: " + data.headers["X-Auth-Token"]);

		if (GoingOut) {
			const newSettings = Object.assign({}, prevSettings, {
				GoingOut: [
					...prevSettings.GoingOut.filter((c: string) => c !== code),
					code,
				],
			});

			data.body = {
				settings: newSettings,
			};

			console.log("New data in method SaveSettings: " + JSON.stringify(data));

			return await instance
				.put(`/settings/update/all`, data.body, data)
				.then((res) => {
					return res.data;
				})
				.catch((error) => console.error("Error in API: " + error));
		} else {
			const newSettings = Object.assign({}, prevSettings, {
				GoingHome: [
					...prevSettings.GoingHome.filter((c) => c !== code),
					code,
				],
			});

			data.body = {
				settings: newSettings,
			};

			console.log("New data: " + JSON.stringify(data));

			return await instance
				.put(`/settings/update/all`, data.body, data)
				.then((res) => {
					return res.data;
				})
				.catch((error) => console.error("Error in API: " + error));
		}
	} catch (error) {
		console.error(error);
	}
};

export const AddCodeToSettings = async (token: string | null, code: string, GoingOut = true) => {
	try {
		if (!token) {
			console.error("No token provided");
			return null;
		}

		console.log("Token in AddCodeToSettings is: " + token);
		data.headers["X-Auth-Token"] = token;
		console.log("Data: " + JSON.stringify(data));

		// Just by code way
		return await instance
			.put(`/settings/update`, { code, GoingOut }, data)
			.then((res) => res.data)
			.catch((error) => console.error("Error in API: " + error));
	} catch (error) {
		console.error(error);
	}
};

export const RemoveCodeFromSettings = async (token: string | null, code: string, GoingOut = true) => {
	try {
		if (!token) {
			console.error("No token provided");
			return null;
		}

		console.log("Token in RemoveCodeFromSettings is: " + token);
		data.headers["X-Auth-Token"] = token;
		console.log("Data: " + JSON.stringify(data));

		// Just by code way
		return await instance
			.put(`/settings/remove`, { code, GoingOut }, data)
			.then((res) => res.data)
			.catch((error) => console.error("Error in API: " + error));
	} catch (error) {
		console.error(error);
	}
};

export const SignIn = async () => {
	console.log("Signing in with facebook");
	const fblogin =
		await WebBrowser.openBrowserAsync(
			`/auth/facebook`
		);

	// If browser is opened
	if (fblogin) {
		console.log(
			"FACEBOOK browser page opened: " +
			JSON.stringify(fblogin)
		);
	}
};

export const LogOut = async () => {
	const result = await instance.get(`/auth/logout`, data);
	// returns true if logged out successfully
	return result.data;
};

export const CheckTokenExpiry = async (token: string | null) => {
	console.log("CheckTokenExpiry - Checking token expiry: " + token);
	data.headers["X-Auth-Token"] = token;
	if (!token) {
		console.warn("Default token has expired");
		return { msg: "Token was not provided.", expired: true };
	}
	const result = await instance.get(`/auth/checkTokenExpiry`, data);
	return result.data;
};

export default {
	GetBusRouteDataWithBusStopCode,
	GetBusRouteData,
	GetBusStopList,
	GetBusStop,
	GetBusStopByCode,
	GetNearbyBusStop,
	SearchBusStop,
	GetBus,
	GetSettings,
	SaveSettings,
	RemoveCodeFromSettings,
	SignIn,
	LogOut,
	CheckTokenExpiry,
};