export interface ISite {
    Name: string
    Description: string
    Address : IAddress
    Id?: string

}

export interface IAddress {
    HouseNumber: string
    StreetName: string
    City: string
    StateCode: string
    Zip: string
    AddressType: string
}