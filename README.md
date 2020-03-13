# bwautoprovision
Auto provisions application, site, sippeer, tn


## Provisioning

Modify the `resources/setup.json` to contain the proper information

run `npm run provision`

A `resources/provisioned.json` file will be created containing the information.
Do not delete this. It is used for cleaup and ordering TNs

## Order Tn 

run `npm run ordertn`

## Clean Up

run `npm run clean`

this uses the provisione.json file to delete the application 

