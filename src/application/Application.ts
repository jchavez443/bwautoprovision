import { BWClient } from "../client/Client"
import { AxiosRequestConfig } from 'axios'
import xml2js  from 'xml2js'
import { IApplication } from "./interfaces"


export class Application {

    static parserOptions = {
        explicitRoot: false, 
        explicitArray: false
    }

    ServiceType: string
    AppName: string
    MsgCallbackUrl: string
    
    ApplicationId: string

    private client: BWClient

    constructor(application: IApplication, client: BWClient = BWClient.defaultInstance()) {

        if(!application.ApplicationId) throw 'No application ID, unable to create application object'

        this.ApplicationId = application.ApplicationId

        this.ServiceType = application.ServiceType
        this.AppName = application.AppName
        this.MsgCallbackUrl = application.MsgCallbackUrl

        this.client = client
    }

    static async create(application: IApplication, client: BWClient = BWClient.defaultInstance()): Promise<Application> {

        let config: AxiosRequestConfig = {
            method : 'POST',
            url: '/applications',
            headers: {
                'Content-Type': 'application/xml'
            },
            data : createApplicationBody(application)
        }

        let res = await client.request(config)

        let json = await xml2js.parseStringPromise(res.data, this.parserOptions )

        return new Application(json.Application, client)

    }

    async delete(){
        let config: AxiosRequestConfig = {
            method : 'DELETE',
            url: `/applications/${this.ApplicationId}`
        }

        let res = await this.client.request(config)

        if(res.status != 200) throw `Application was not deleted, applicationId = ${this.ApplicationId}`

        this.ApplicationId = null
 
    }
}

function createApplicationBody(application: IApplication) : string{

    return `
    <Application>
        <ServiceType>${application.ServiceType}</ServiceType>
        <AppName>${application.AppName}</AppName>
        <MsgCallbackUrl>${application.MsgCallbackUrl}</MsgCallbackUrl>
    </Application>
    `
}