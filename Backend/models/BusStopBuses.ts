export interface IBusStopBuses {
    BusStopCode: string;
    BusService: string;
    Tracked: boolean;
}

export class BusStopBuses implements IBusStopBuses {
    BusStopCode: string;
    BusService: string;
    Tracked: boolean = false;
}