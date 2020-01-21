import { Site } from "../site/Site";

export interface ISipPeer {
    PeerName: string
    IsDefaultPeer : boolean
    Id?: string
    Site?: Site
}