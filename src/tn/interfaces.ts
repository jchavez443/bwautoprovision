export interface IOrder {
    id: string
    OrderCreateDate: string
    SiteId: string
    PeerId: string
}

export interface IOrderResponse {
    CompletedQuantity: number
    Order: IOrder
    OrderStatus: string
    Summary: string
}