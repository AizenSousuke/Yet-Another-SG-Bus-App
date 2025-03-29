export interface ISettingsSlice {
    id: String | null;
    darkMode: Boolean;
    createdAt: String;
    updatedAt?: String | null;

    // Note: Other items are in IBusStopSlice
}