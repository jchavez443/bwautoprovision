import { ISite } from "./site/interfaces";
import { IApplication } from "./application/interfaces";
import { ISipPeer } from "./sippeer/interfaces";

export interface ISetup {
    site: ISite
    application: IApplication
    sipPeer: ISipPeer
}

export interface ICreds {
    username: string
    password: string
    accountId: string
}