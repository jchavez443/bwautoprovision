const TnOrder = require('./out/index').OrderNumber;
const fs = require('fs-extra');

const creds = {
    username: process.env.IRIS_USERNAME,
    password: process.env.IRIS_PASSWORD,
    accountId: process.env.IRIS_ACCOUNT_ID
};

const filePath = './resources/provisioned.json'

const json = fs.readFileSync(filePath).toString();

const jso = JSON.parse(json);

TnOrder(jso, creds)
    .then((result) => {
        console.log(JSON.stringify(result, (key, value) => {return key == 'client' ?  undefined : value }, 2));

        fs.writeFileSync(`./resources/order_${result.order.id}.json`, JSON.stringify(result, (key, value) => {return key == 'client' ?  undefined : value }, 2))
    })
    .catch((error ) => {
        console.error(error); 
        if(error.response && error.response.data) console.log(error.response.data)
    } );