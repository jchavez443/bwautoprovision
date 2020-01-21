import { BWClient } from "../client/Client"
import { AxiosRequestConfig } from 'axios'
import xml2js  from 'xml2js'
import { Site } from "../site/Site"
import { SipPeer } from "../sippeer/SipPeer"
import { IOrder, IOrderResponse } from "./interfaces"

export class Tns {

    static parserOptions = {
        explicitRoot: false, 
        explicitArray: false
    }

    private client: BWClient

    constructor(client: BWClient = BWClient.defaultInstance()) {

        this.client = client
    }

    static async getAvalableNumber(state: string = 'NC', client: BWClient = BWClient.defaultInstance()) : Promise<string> {
        let config: AxiosRequestConfig = {
            method : 'GET',
            url: `/availableNumbers?State=${state}&quantity=1`
        }

        let res = await client.request(config)
        
        let jso = typeof res.data == 'string' ? JSON.parse(await xml2js.parseStringPromise(res.data, this.parserOptions )) : res.data

        if(jso.ResultCount != 1) throw `Error ${jso.ResultCount} numbers returned when 1 needed`

        return jso.TelephoneNumberList[0]
    }

    static async orderPhoneNumber(tn: string, sippeer: SipPeer, client: BWClient = BWClient.defaultInstance()) : Promise<IOrder> {
        let config: AxiosRequestConfig = {
            method : 'POST',
            url: `/orders`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data: createOrderBody([tn], sippeer)
        }

        let res = await client.request(config)
        
        let json = await xml2js.parseStringPromise(res.data, this.parserOptions )

        let jso = typeof json == 'string' ? JSON.parse(json) : json

        if(res.status != 201) throw `Error ordering the tn ${tn} for Site ${sippeer.Site.Id}`

        return jso.Order

    }

    static async disconnect(tns: string[], client: BWClient = BWClient.defaultInstance()) {
        let config: AxiosRequestConfig = {
            method : 'POST',
            url: `/disconnects`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data: createDisconnectBody(tns)
        }

        let res = await client.request(config)
        
        let json = await xml2js.parseStringPromise(res.data, this.parserOptions )

        let jso = typeof json == 'string' ? JSON.parse(json) : json

        if(res.status != 201) throw `Error disconnecting the tns ${tns.toString()}`

        return jso

    }

    static async fetchOrderInfo(order: IOrder, client: BWClient = BWClient.defaultInstance()) : Promise<IOrderResponse>{
        let config: AxiosRequestConfig = {
            method : 'GET',
            url: `orders/${order.id}`,
        }

        let res = await client.request(config)
        
        let json = await xml2js.parseStringPromise(res.data, this.parserOptions )

        let jso = typeof json == 'string' ? JSON.parse(json) : json

        if(res.status != 200) throw `Error could not get info about order ${order.id}`

        return jso
    }
}

function createOrderBody(tns: string[], sippeer: SipPeer){

    let tnsXML = ""

    for(var tn of tns ){
        tnsXML = tnsXML.concat(`<TelephoneNumber>${tn}</TelephoneNumber>`)
    }

    return `
    <Order>
        <Name>Auto Number Order</Name>
        <ExistingTelephoneNumberOrderType>
            <TelephoneNumberList>
                ${tnsXML}
            </TelephoneNumberList>
        </ExistingTelephoneNumberOrderType>
        <SiteId>${sippeer.Site.Id}</SiteId>
        <PeerId>${sippeer.Id}</PeerId>
    </Order>
    `
}

function createDisconnectBody(tns: string[]){

    let tnsXML = ""

    for(var tn of tns ){
        tnsXML = tnsXML.concat(`<TelephoneNumber>${tn}</TelephoneNumber>`)
    }

    return `
    <DisconnectTelephoneNumberOrder>
        <name>Auto disconnect</name>
        <DisconnectTelephoneNumberOrderType>
            <TelephoneNumberList>
                ${tnsXML}
            </TelephoneNumberList>
        </DisconnectTelephoneNumberOrderType>
    </DisconnectTelephoneNumberOrder>
    `

}
