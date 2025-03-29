import { createSlice } from "@reduxjs/toolkit";
import { ISettingsSlice } from "../../../interfaces/ISettingsSlice";

const initialState: ISettingsSlice = {
    id: null,
    darkMode: false,
    createdAt: new Date().toISOString()
}

export const SettingsSlice = createSlice({
    initialState: initialState,
    name: "SettingsSlice",
    reducers: {
        updateSettings: (state, action) => {
            Object.assign(state, action.payload, {
                updatedAt: new Date().toISOString()
            });
        },
        removeSettings: (state, action) => {
            return initialState;
        }
    }
});