export interface IBusStopSetting {
    Id: string;
    BusStopId: string;
    BusServicesIDs: string[];

    SettingsSchemaGoingHomeId?: string;
    SettingsSchemaGoingOutId?: string;
}

export interface IBusStopSlice {
    GoingOut: { [BusStopCode: string]: ISavedBusStopBuses };
    GoingHome: { [BusStopCode: string]: ISavedBusStopBuses };
}

export interface ISavedBusStopBuses {
    BusesTracked: { [busNumber: string]: any };
}