interface IBusStopBuses {
    BusStopCode: string;
    BusService: string;
    Tracked: boolean;
}

class BusStopBuses implements IBusStopBuses {
    BusStopCode: string;
    BusService: string;
    Tracked: boolean = false;
}