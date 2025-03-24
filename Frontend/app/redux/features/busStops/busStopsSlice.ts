import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api"
import { ToastAndroid } from "react-native";
import { Direction } from "../../../classes/Enums";
import { IBusStopSlice, ISavedBusStopBuses } from "../../../interfaces/IBusStopSlice";

const initialState: IBusStopSlice = {
    GoingOut: {},
    GoingHome: {}
}

export const getSettings = createAsyncThunk('Home/getSettings', async (token: string) => {
    return await api.GetSettings(token);
})

/**
 * This slice takes care of saving which bus stops and 
 * buses are shown (saved) for each bus stops
 */
export const BusStopsSlice = createSlice({
    name: 'BusStops',
    initialState: initialState,
    reducers: {
        addBusStopBus: (state, action) => {
            console.log("action payload: " + JSON.stringify(action.payload));
            const { direction, busStopCode, busNumber }: { direction: Direction, busStopCode: string, busNumber?: string } = action.payload;
            console.log("bus stop code: " + JSON.stringify(busStopCode));

            const currentDirection = direction == Direction.GoingOut ? "GoingOut" : "GoingHome";

            let busStop: ISavedBusStopBuses = state[currentDirection][busStopCode];

            if (!busStop) {
                state[currentDirection][busStopCode] = { BusesTracked: {} };
            }

            if (busNumber) {
                state[currentDirection][busStopCode].BusesTracked[busNumber] = busNumber;
            }

            console.log("State after addBusStopBus: " + JSON.stringify(state[currentDirection]));
        },
        removeBusStopBus: (state, action) => {
            const { direction, busStopCode, busNumber }: { direction: Direction, busStopCode: string, busNumber: string } = action.payload;

            const currentDirection = direction == Direction.GoingOut ? "GoingOut" : "GoingHome";

            let busStop: ISavedBusStopBuses = state[currentDirection][busStopCode];
            if (!busStop) {
                state[currentDirection][busStopCode] = { BusesTracked: {} };
            }

            if (busNumber) {
                delete busStop.BusesTracked[busNumber];
            } else {
                // Delete the whole busStop
                delete state[currentDirection][busStopCode];
            }
        },
        emptyBusStop: (state, action) => {
            const { direction } = action.payload;

            const currentDirection = direction == Direction.GoingOut ? "GoingOut" : "GoingHome";

            state[currentDirection] = {};
        },
        goingOut: (state, action) => {
            state.GoingOut = action.payload;
        },
        goingHome: (state, action) => {
            state.GoingHome = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getSettings.pending, (state, action) => {
        });
        builder.addCase(getSettings.fulfilled, (state, action) => {
            state.GoingOut = action.payload.settings?.Settings?.GoingOut;
            state.GoingHome = action.payload.settings?.Settings?.GoingHome;
            ToastAndroid.show("Successfully get settings", ToastAndroid.SHORT);
        });
        builder.addCase(getSettings.rejected, (state, action) => {
            ToastAndroid.show(
                "Failed to get settings",
                ToastAndroid.SHORT
            );
        });
    }
})

export const { addBusStopBus, removeBusStopBus, emptyBusStop } = BusStopsSlice.actions;