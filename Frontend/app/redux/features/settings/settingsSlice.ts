import { createSlice } from "@reduxjs/toolkit";
import { ISettingsSlice } from "../../../interfaces/ISettingsSlice";

const now = new Date(Date.now());

const initialState: ISettingsSlice = {
    id: null,
    darkMode: false,
    createdAt: now
}

export const SettingsSlice = createSlice({
    initialState: initialState,
    name: "SettingsSlice",
    reducers: {
        updateSettings: (state, action) => {
            Object.assign(state, action.payload, {
                updatedAt: now
            });
        },
        removeSettings: (state, action) => {
            return initialState;
        }
    }
});