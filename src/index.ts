import { BWClient } from "./client/Client";
import { Application } from "./application/Application";
import { Site } from "./site/Site";
import { SipPeer } from "./sippeer/SipPeer";
import { ISetup, ICreds } from "./interfaces";


export async function Provision(setup: ISetup, creds : ICreds) {

    const client = new BWClient(creds.username, creds.password, creds.accountId)

    const application = await Application.create(setup.application, client)

    const site = await Site.create(setup.site, client)

    const sippeer = await SipPeer.create(site, setup.sipPeer, client)

    await sippeer.assignApplication(application)

    console.log(`Successfully Provisioned`)

    const provisioned ={
        sipPeer : sippeer,
        site: site,
        application: application
    }

    return provisioned
}

export async function CleanUp(provisioned: ISetup, creds : ICreds) {

    const client = new BWClient(creds.username, creds.password, creds.accountId)


    const application = new Application(provisioned.application)

    const site = new Site(provisioned.site)

    const sippeer = new SipPeer(provisioned.sipPeer)

    await sippeer.unAssignApplication()
    await sippeer.deleteSMSFeature()
    await sippeer.delete()

    await site.delete()

    await application.delete()


    console.log(`Successfully Cleaned Up`)

    const Cleaned = {
        application: application,
        site: site,
        sipPeer: sippeer
    }

    return Cleaned
}
