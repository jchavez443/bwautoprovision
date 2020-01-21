
import { BWClient } from "../client/Client"
import { AxiosRequestConfig } from 'axios'
import xml2js  from 'xml2js'
import { ISipPeer } from "./interfaces"
import { Site } from "../site/Site"
import { Application } from "../application/Application"

export class SipPeer {

    static parserOptions = {
        explicitRoot: false, 
        explicitArray: false
    }

    PeerName: string
    IsDefaultPeer : boolean

    Id: string
    Site: Site
    Application: Application

    private client: BWClient

    constructor(sipPeer: ISipPeer, client: BWClient = BWClient.defaultInstance()) {

        if(!sipPeer.Id) throw 'No SipPeer ID, unable to create SipPeer object'
        if(!sipPeer.Site) throw 'No Site for SipPeer, unable to create SipPeer object'

        this.Site = sipPeer.Site
        this.Id = sipPeer.Id

        this.PeerName = sipPeer.PeerName
        this.IsDefaultPeer = sipPeer.IsDefaultPeer

        this.client = client
    }

    static async create(site: Site, sipPeer: ISipPeer, client: BWClient = BWClient.defaultInstance()): Promise<SipPeer> {

        let config: AxiosRequestConfig = {
            method : 'POST',
            url: `/sites/${site.Id}/sippeers`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data : createSipPeerBody(sipPeer)
        }

        let res
        try {
            res = await client.request(config)
        } catch( err ){
            console.log( err )
            return
        }

        let loc : string = res.headers.location
        sipPeer.Id = loc.split('/').pop()
        sipPeer.Site = site

        const newSipPeer =  new SipPeer(sipPeer, client)


        //Enable the features for SMS
        config = {
            method : 'POST',
            url: `/sites/${site.Id}/sippeers/${newSipPeer.Id}/products/messaging/features/sms`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data : createSipPeerFeaturesSMSBody()
        }

        try {
            res = await client.request(config)
        } catch( err ){
            console.log( err )
            return
        }

        
        return newSipPeer
    }

    async assignApplication(application: Application){
        let config: AxiosRequestConfig = {
            method : 'PUT',
            url: `/sites/${this.Site.Id}/sippeers/${this.Id}/products/messaging/applicationSettings`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data : createAssignApplictionBody(application)
        }

        let res = await this.client.request(config)
       
        this.Application = application
    }

    async unAssignApplication(){
        let config: AxiosRequestConfig = {
            method : 'PUT',
            url: `/sites/${this.Site.Id}/sippeers/${this.Id}/products/messaging/applicationSettings`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data : `<ApplicationsSettings>
                        REMOVE
                    </ApplicationsSettings>
                    `
        }

        let res = await this.client.request(config)

        if(res.status != 200) throw `Application was NOT unassigned from SipPeerId = ${this.Id}.  ApplicationId = ${this.Application.ApplicationId}`
       
        this.Application = null
    }

    async delete(){
        let config: AxiosRequestConfig = {
            method : 'DELETE',
            url: `/sites/${this.Site.Id}/sippeers/${this.Id}`
        }

        let res = await this.client.request(config)

        if(res.status != 200 ) throw `The SipPeer was not deleted.  SipPeerId = ${this.Id}`

        this.Id = null
    }

    async deleteSMSFeature(){
        let config: AxiosRequestConfig = {
            method : 'DELETE',
            url: `/sites/${this.Site.Id}/sippeers/${this.Id}/products/messaging/features/sms`
        }

        let res = await this.client.request(config)

        if(res.status != 200 ) throw `The SMS feature was not deleted.  SipPeerId = ${this.Id}`
    }


}


function createSipPeerBody(sipPeer: ISipPeer) : string {

    return `
    <SipPeer>
        <PeerName>${sipPeer.PeerName}</PeerName>
        <IsDefaultPeer>${sipPeer.IsDefaultPeer}</IsDefaultPeer>
    </SipPeer>
    `
}

function createSipPeerFeaturesSMSBody() : string {
    return `<SipPeerSmsFeature>
                <SipPeerSmsFeatureSettings>
                <TollFree>true</TollFree>
                <ShortCode>true</ShortCode>
                <Protocol>HTTP</Protocol>
                <Zone1>true</Zone1>
                <Zone2>false</Zone2>
                <Zone3>false</Zone3>
                <Zone4>false</Zone4>
                <Zone5>false</Zone5>
                </SipPeerSmsFeatureSettings>
                <HttpSettings />
            </SipPeerSmsFeature>`
}

function createAssignApplictionBody(application: Application) {

    return `
    <ApplicationsSettings>
        <HttpMessagingV2AppId>${application.ApplicationId}</HttpMessagingV2AppId>
    </ApplicationsSettings>`
}