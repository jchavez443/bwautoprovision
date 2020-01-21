import { BWClient } from "../client/Client"
import { AxiosRequestConfig } from 'axios'
import xml2js  from 'xml2js'
import { ISite, IAddress } from "./interfaces"

export class Site {

    static parserOptions = {
        explicitRoot: false, 
        explicitArray: false
    }

    Name: string
    Description: string
    Address : IAddress

    Id: string

    private client: BWClient

    constructor(site: ISite, client: BWClient = BWClient.defaultInstance()) {

        if(!site.Id) throw 'No site ID, unable to create site object'

        this.Id = site.Id

        this.Name = site.Name
        this.Description = site.Description
        this.Address = site.Address

        this.client = client
    }

    static async create(site: ISite, client: BWClient = BWClient.defaultInstance()): Promise<Site> {

        let config: AxiosRequestConfig = {
            method : 'POST',
            url: '/sites',
            headers: {
                'Content-Type': 'application/xml'
            },
            data : createSiteBody(site)
        }

        let res = await client.request(config)
        
        let json = await xml2js.parseStringPromise(res.data, this.parserOptions )

        return new Site(json.Site, client)

    }

    async delete(){
        let config: AxiosRequestConfig = {
            method : 'DELETE',
            url: `/sites/${this.Id}`
        }

        let res = await this.client.request(config)

        if(res.status != 200) throw `The site was not deleted.  SiteId = ${this.Id}`

        this.Id = null
    }
}


//Will have siteId in response
function createSiteBody(site: ISite) : string{

    return `
    <Site>
        <Name>${site.Name}</Name>
        <Description>${site.Description}</Description>
        <CustomerName>${site.Name}</CustomerName>
        <Address>
            <HouseNumber>${site.Address.HouseNumber}</HouseNumber>
            <StreetName>${site.Address.StreetName}</StreetName>
            <City>${site.Address.City}</City>
            <StateCode>${site.Address.StateCode}</StateCode>
            <Zip>${site.Address.Zip}</Zip>
            <AddressType>${site.Address.AddressType}</AddressType>
        </Address>
    </Site>
    `
}