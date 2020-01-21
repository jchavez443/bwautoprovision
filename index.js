const provision = require('./out/index').Provision;
const fs = require('fs-extra');

const creds = {
    username: process.env.IRIS_USERNAME,
    password: process.env.IRIS_PASSWORD,
    accountId: process.env.IRIS_ACCOUNT_ID
};

const json = fs.readFileSync('./resources/setup.json').toString();

const jso = JSON.parse(json);

jso.site.Name = jso.application.AppName + '-SubAccount';
jso.sipPeer.PeerName = jso.site.Name + '-SipPeer';


provision(jso, creds)
    .then((result) => {
        console.log(result);

        fs.writeFileSync('./resources/provisioned.json', JSON.stringify(result, (key, value) => {return key == 'client' ?  undefined : value }, 2))
    })
    .catch((error ) => {
        console.error(error); 
    } );