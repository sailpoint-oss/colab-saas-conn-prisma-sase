import { Config } from "../model/config";
import { AxiosWrapper } from "./axios-wrapper";
import { HTTP } from "./http";

export class HTTPFactory {
    static getHTTP(): HTTP {
        return new AxiosWrapper()
    }
}