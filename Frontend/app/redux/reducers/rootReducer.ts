import { combineReducers, UnknownAction } from "@reduxjs/toolkit";
import { createAction } from '@reduxjs/toolkit';
import { HomePageSlice } from "../features/homePage/homePageSlice";
import { BusStopsSlice } from "../features/busStops/busStopsSlice";
import { SettingsSlice } from "../features/settings/settingsSlice";

// Optional root Reducer
const appReducer = combineReducers({
    home: HomePageSlice.reducer,
    busStop: BusStopsSlice.reducer,
    // user: userReducer,
    settings: SettingsSlice.reducer,
});

export const RESET = 'RESET';
export const resetStore = createAction(RESET);

const rootReducer = (state: any, action: any) => {
    if (action.type === RESET) {
        console.log("Setting undefined to state");
        state = undefined;
    }

    return appReducer(state, action);
}

export default rootReducer;