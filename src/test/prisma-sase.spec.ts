import { ConnectorError, StandardCommand } from '@sailpoint/connector-sdk'
import { PrismaSASEClient } from '../prisma-sase'

const mockConfig: any = {
    token: 'xxx123'
}

describe('connector client unit tests', () => {

    const myClient = new PrismaSASEClient(mockConfig)

    it('connector client test connection', async () => {
        expect(await myClient.testConnection()).toStrictEqual({})
    })

    it('connector client test connection', async () => {
        expect(await myClient.testConnection()).toStrictEqual({})
    })

    it('invalid connector client', async () => {
        try {
            new PrismaSASEClient({})
        } catch (e) {
            expect(e instanceof ConnectorError).toBeTruthy()
        }
    })
})
