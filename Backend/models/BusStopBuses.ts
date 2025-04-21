export interface IBusStopBuses {
    busStopCode: string;
    busService: string;
    tracked: boolean;
}

export class BusStopBuses implements IBusStopBuses {
    busStopCode: string;
    busService: string;
    tracked: boolean = false;
}