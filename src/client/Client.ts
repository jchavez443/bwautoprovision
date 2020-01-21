import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export class BWClient {

    private userAgent = 'bwautoprovision'

    private baseUrl: string

    private username: string
    private password: string
    private accountId: string

    private client: AxiosInstance

    private static default: BWClient


    constructor(username: string, password: string, accountId: string, baseUrl = "https://dashboard.bandwidth.com/api/"){
        this.username = username
        this.password = password
        this.accountId = accountId
        this.baseUrl = baseUrl

        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
        })
    }

    static defaultInstance() {

        if(this.default) return this.default

        const username = process.env.IRIS_USERNAME;
        const password = process.env.IRIS_PASSWORD;
        const accountId = process.env.IRIS_ACCOUNT_ID;

        this.default = new BWClient(username, password, accountId)

        return this.default
    }

    async request(config: AxiosRequestConfig){

        config.url = this.applyAccountId(config.url)

        if(config.headers) {
            config.headers['User-Agent'] = this.userAgent
        } else {
            config.headers = {'User-Agent' : this.userAgent}
        }

        config.auth = {
            username: this.username,
            password: this.password
        }

       return await this.client( config )
    }

    private applyAccountId(path: string) : string{
        
        return path.startsWith('/') ? `accounts/${this.accountId}${path}` : `accounts/${this.accountId}/${path}`
            

    }

}