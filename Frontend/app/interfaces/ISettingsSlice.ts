export interface ISettingsSlice {
    id: String | null;
    darkMode: Boolean;
    createdAt: Date;
    updatedAt?: Date | null;

    // Note: Other items are in IBusStopSlice
}