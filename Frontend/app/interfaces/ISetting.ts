import { IBusStopSetting } from "./IBusStopSetting";

export interface ISetting {
    darkMode: Boolean;
    createdAt: String;
    updatedAt?: String | null;

    settingsSchema?: ISettingsSchema;
}

export interface ISettingsSchema {
    goingOut: IBusStopSetting[];
    goingHome: IBusStopSetting[];
}