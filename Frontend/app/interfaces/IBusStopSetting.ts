export interface IBusStopSetting {
    busStop: IBusStop;
    busStopServices: IBusStopService[];
}

export interface IBusStop {
    busStopCode: string;
}

export interface IBusStopService {
    busServiceId: string;
    busService: IBusService;
}

export interface IBusService {
    serviceNo: string;
}