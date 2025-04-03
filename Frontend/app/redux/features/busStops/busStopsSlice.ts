import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";
import { ToastAndroid } from "react-native";
import { Direction } from "../../../classes/Enums";
import { ISettingsSchema } from "../../../interfaces/ISetting";
import { IBusStopSetting } from "../../../interfaces/IBusStopSetting";

const initialState: ISettingsSchema = {
    goingOut: [],
    goingHome: []
};

export const getSettings = createAsyncThunk('Home/getSettings', async (token: string) => {
    return await api.GetSettings(token);
});

/**
 * This slice takes care of saving which bus stops and 
 * buses are shown (saved) for each bus stops
 */
export const BusStopsSlice = createSlice({
    name: 'BusStops',
    initialState: initialState,
    reducers: {
        addBusStopBus: (state: ISettingsSchema, action) => {
            console.log("action payload: " + JSON.stringify(action.payload));
            const { direction, busStopCode, busNumber }: { direction: Direction, busStopCode: string, busNumber?: string; } = action.payload;
            console.log("bus stop code: " + JSON.stringify(busStopCode));

            const currentDirection = direction == Direction.GoingOut ? "goingOut" : "goingHome";

            let busStop: IBusStopSetting | undefined = state[currentDirection].find(src => src.busStop.busStopCode == busStopCode);

            if (!busStop) {
                busStop = {
                    busStop: {
                        busStopCode: busStopCode,
                    },
                    busStopServices: []
                };
                state[currentDirection].push(busStop);
            }

            if (busNumber) {
                state[currentDirection].find(src => src.busStop.busStopCode == busStopCode)?.busStopServices.push({
                    busService: {
                        serviceNo: busNumber
                    }
                });
            }

            console.log("State after addBusStopBus: " + JSON.stringify(state[currentDirection]));
        },
        removeBusStopBus: (state, action) => {
            const { direction, busStopCode, busNumber }: { direction: Direction, busStopCode: string, busNumber: string; } = action.payload;

            const currentDirection = direction == Direction.GoingOut ? "goingOut" : "goingHome";

            let busStop: IBusStopSetting | undefined = state[currentDirection].find(src => src.busStop.busStopCode == busStopCode);

            if (!busStop) {
                busStop = {
                    busStop: {
                        busStopCode: busStopCode,
                    },
                    busStopServices: []
                };
                state[currentDirection].push(busStop);
            }

            if (busNumber) {
                state[currentDirection].find(src => src.busStop.busStopCode == busStopCode)?.busStopServices.push({
                    busService: {
                        serviceNo: busNumber
                    }
                });
            }

            if (busNumber) {
                state[currentDirection].find(src => src.busStop.busStopCode == busStopCode)?.busStopServices.filter(src => src.busService.serviceNo != busNumber);
            } else {
                // Delete the whole busStop
                state[currentDirection].filter(src => src.busStop.busStopCode != busStopCode);
            }
        },
        emptyBusStop: (state, action) => {
            const { direction } = action.payload;

            const currentDirection = direction == Direction.GoingOut ? "goingOut" : "goingHome";

            // Resets the bus stops at the given direction
            state[currentDirection] = [];
        },
        goingOut: (state, action) => {
            state.goingOut = action.payload;
        },
        goingHome: (state, action) => {
            state.goingHome = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getSettings.pending, (state, action) => {
        });
        builder.addCase(getSettings.fulfilled, (state, action) => {
            state.goingOut = action.payload.settings?.Settings?.GoingOut;
            state.goingHome = action.payload.settings?.Settings?.GoingHome;
            ToastAndroid.show("Successfully get settings", ToastAndroid.SHORT);
        });
        builder.addCase(getSettings.rejected, (state, action) => {
            ToastAndroid.show(
                "Failed to get settings",
                ToastAndroid.SHORT
            );
        });
    }
});

export const { addBusStopBus, removeBusStopBus, emptyBusStop } = BusStopsSlice.actions;