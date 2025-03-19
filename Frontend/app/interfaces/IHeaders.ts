export interface IHeaders {
    Accept: string;
    "Content-Type": string;
    "X-Auth-Token": string | null;
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Headers": string;
}

export default IHeaders;