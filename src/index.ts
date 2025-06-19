import {
    Context,
    createConnector,
    readConfig,
    Response,
    logger,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdTestConnectionOutput,
    StdAccountListInput,
    StdTestConnectionInput,
    StdEntitlementListInput,
    StdEntitlementListOutput,
    StdEntitlementReadInput,
    StdEntitlementReadOutput,
    ConnectorError,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdAccountCreateInput,
    StdAccountCreateOutput
} from '@sailpoint/connector-sdk'
import { Util } from './tools/util'
import { PrismaSASEClient } from './prisma-sase'

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()

    // Setup Util
    const util = new Util();

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const myClient = new PrismaSASEClient(config)
    const userUpdatePause = config.userUpdatePause ? config.userUpdatePause : 500

    return createConnector()
        .stdTestConnection(async (context: Context, input: StdTestConnectionInput, res: Response<StdTestConnectionOutput>) => {
            logger.debug("Running test connection.")
            res.send(await myClient.testConnection())
        })
        .stdAccountList(async (context: Context, input: StdAccountListInput, res: Response<StdAccountListOutput>) => {
            logger.debug("Running stdAccountList.")
            const accounts = await myClient.getAllAccounts()
            for (const account of accounts) {
                res.send(util.userToAccount(account))
            }
            logger.info(`stdAccountList sent ${accounts.length} accounts`)
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            logger.debug("Running stdAccountRead.")
            const account = await myClient.getAccount(input.identity)
            res.send(util.userToAccount(account))
            logger.info(`stdAccountRead read account : ${input.identity}`)

        })
        .stdEntitlementList(async (context: Context, input: StdEntitlementListInput, res: Response<StdEntitlementListOutput>) => {
            logger.debug("Running stdEntitlementList.")
            switch (input.type) {
                case 'role':
                    var entitlements = await myClient.getAllEntitlements(input.type)
                    break
                case 'custom_role':
                    var entitlements = await myClient.getAllEntitlements(input.type)
                    break
                case 'csp_role':
                    var entitlements = await myClient.getAllEntitlements(input.type)
                    break
                default:
                    const message = `Unsupported entitlement type ${input.type}`
                    throw new ConnectorError(message)
            }
            for (const entitlement of entitlements) {
                res.send(util.groupToEntitlement(entitlement, input.type))
            }
            if (entitlements.length == 0) {

            }
            logger.info(`stdEntitlementList sent ${entitlements.length} entitlements`)
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            logger.debug("Running stdEntitlementRead.")
            const entitlement = await myClient.getEntitlement(input.identity, input.type)
            res.send(util.groupToEntitlement(entitlement, input.type))
            logger.info(`stdEntitlementRead read entitlement : ${input.identity}`)
        })
        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            logger.debug(input, 'account create input object')
            const user = await myClient.createAccount(util.accountToUser(input))
            logger.debug(user, 'new PAN user object')
            res.send(util.userToAccount(user))
        })
        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            logger.debug(input, 'account update input object')
            //Check that the user currently exists
            const origUser = await myClient.getAccount(input.identity)
            if(!origUser)
                throw new ConnectorError(`User ${input.identity} does not exist or does not exist in this tenant.`)
            logger.debug(origUser, 'Prisma SASE user found')

            // Update the account
            let update = await myClient.updateAccount(input.identity, input.changes)
            console.log(`Status: ${update}`)
            // Wait for the PAN APIs
            await new Promise(f => setTimeout(f, userUpdatePause));
            //Get the new user
            let newAccount =  await myClient.getAccount(input.identity)
            console.log('New Account: ' + JSON.stringify(newAccount))
            res.send(util.userToAccount(newAccount))
        })
}