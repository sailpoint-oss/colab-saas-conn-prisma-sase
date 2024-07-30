import { AttributeChange, AttributeChangeOp, ConnectorError, logger } from "@sailpoint/connector-sdk"
import { check_token_expiration, auth } from "./tools/generic-functions"
import { HTTPFactory } from "./http/http-factory"
import { User } from "./model/user"
import { Entitlement } from "./model/entitlement"
import { applications } from "./data/applications"
import { rolesRef } from "./data/roles"
import { AxiosError } from "axios"

export class PrismaSASEClient {

    constructor(config: any) {
        // Fetch necessary properties from config.

        // Remove trailing slash in URL if present.  Then store in Global Variables.
        if (config?.baseURL.substr(config?.baseURL.length - 1) == '/') {
            globalThis.__BASE_URL = config?.baseURL.substr(0, config?.instance.length - 1)
        } else {
            globalThis.__BASE_URL = config?.baseURL
        }

        // Remove trailing slash in Auth URL if present.  Then store in Global Variables.
        if (config?.authUrl.substr(config?.authUrl.length - 1) == '/') {
            globalThis.__AUTHURL = config?.authUrl.substr(0, config?.authUrl.length - 1)
        } else {
            globalThis.__AUTHURL = config?.authUrl
        }

        // Store Client Credentials in Global Variables
        globalThis.__CLIENT_ID = config?.client_id
        globalThis.__CLIENT_SECRET = config?.client_secret
        globalThis.__TSGID = config?.tsg_id
        globalThis.__READ_ALL_TENANTS = config.readAllTenants ? config.readAllTenants : false
        // pageSize for GET all Records
        globalThis.__pageSize = 50
        globalThis.__USER_PAUSE = config.userUpdatePause ? config.userUpdatePause : 500
    }

    async checkTokenValidity(): Promise<void> {
        let valid_token = await check_token_expiration()
        if ((valid_token == 'undefined') || (valid_token == 'expired')) {
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await auth()
            logger.info(`Auth Status : ${JSON.stringify(resAuth.status)}`)
        }
        else if (valid_token == 'valid') {
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
        }
    }

    async getAllAccounts(): Promise<User[]> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();

        // We get all the lists of permission sets.
        const response = await httpClient.get('iam/v1/access_policies').catch((error: unknown) => {
            throw new ConnectorError(`Failed to retrieve access policies: ${error}`)
        })
        var access_policies = response.data.items

        // Each user can have multiple access policies so store in a map so we can combine them. 
        let users = new Map<string, User>()
        for (var access_policy of access_policies) {
            // Check if reading all tenants of if it matches the correct TSGID
            if (globalThis.__READ_ALL_TENANTS || access_policy.inherited_from == globalThis.__TSGID) {

                // Check if user already exists in our map
                if (users.has(access_policy.principal)) {
                    // Create entitlement object
                    let entitlement = new Entitlement()
                    entitlement.resource = access_policy.resource
                    entitlement.role = access_policy.role

                    // Append it to existing user
                    let user = users.get(access_policy.principal)!
                    if (entitlement.role?.includes(':')) {
                        user.custom_roles?.push(entitlement)
                    } else {
                        user.roles?.push(entitlement)
                    }

                    // Set the user in the map
                    users.set(access_policy.principal, user)
                } else {
                    // New user - create user object
                    let user = new User()
                    user.principal = access_policy.principal
                    user.principal_display_name = access_policy.principal_display_name
                    user.principal_type = access_policy.principal_type
                    // Create first entitlement for the user
                    let entitlement = new Entitlement()
                    entitlement.resource = access_policy.resource
                    entitlement.role = access_policy.role
                    user.roles = []
                    user.custom_roles = []
                    if (entitlement.role?.includes(':')) {
                        user.custom_roles.push(entitlement)
                    } else {
                        user.roles.push(entitlement)
                    }

                    // Set the user in the map
                    users.set(access_policy.principal, user)
                }
            }
        }
        // Return the list of values
        return Array.from(users.values())
    }

    async getAccount(identity: string): Promise<User> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();

        // We get all the lists of permission sets.
        const response = await httpClient.get('iam/v1/access_policies?principal=' + identity).catch((error: unknown) => {
            throw new ConnectorError(`Failed to retrieve access policies for user ${identity}: ${error}`)
        })
        var access_policies = response.data.items
        let user = new User()
        user.principal = access_policies[0].principal
        user.principal_display_name = access_policies[0].principal_display_name
        user.principal_type = access_policies[0].principal_type
        user.roles = []
        user.custom_roles = []
        for (var access_policy of access_policies) {
            let entitlement = new Entitlement()
            entitlement.resource = access_policy.resource
            entitlement.role = access_policy.role
            if (entitlement.role?.includes(':')) {
                user.custom_roles.push(entitlement)
            } else {
                user.roles.push(entitlement)
            }

        }
        return user
    }

    async assignAccessPolicyFromValue(principal: string, value: string): Promise<boolean> {
        var val: string = value
        var resource = val.substring(0, val.indexOf('/'))
        var role = val.substring(val.indexOf('/') + 1)
        return this.assignAccessPolicy(principal, resource, role)
    }

    async assignAccessPolicy(principal: string, resource: string, role: string): Promise<boolean> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();

        await httpClient.post<void>(`iam/v1/access_policies`, {
            principal: principal,
            resource: resource,
            role: role
        }).catch((error: AxiosError) => {
            throw new ConnectorError(error.message)
        })

        return true
    }

    async getAccessPolicyId(role: string, principal: string, resource: string): Promise<string> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();

        // We get all the lists of permission sets.
        const response = await httpClient.get(`iam/v1/access_policies?principal=${principal}&role=${role}`).catch((error: unknown) => {
            throw new ConnectorError(`Failed to retrieve access policies: ${error}`)
        })
        var access_policies = response.data.items
        for (var access_policy of access_policies) {
            if (access_policy.resource == resource) {
                return access_policy.id
            }
        }
        throw new ConnectorError(`Unable to find the role ${role} for user ${principal} with resource ${resource}.`)
    }

    async deleteAccessPolicyFromValue(principal: string, value: string): Promise<boolean> {
        var val: string = value
        var resource = val.substring(0, val.indexOf('/'))
        var role = val.substring(val.indexOf('/') + 1)
        var apId = await this.getAccessPolicyId(role, principal, resource)
        return this.deleteAccessPolicyFromId(apId)
    }

    async deleteAccessPolicyFromId(id: string): Promise<boolean> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();

        // We get all the lists of permission sets.
        const response = await httpClient.delete(`iam/v1/access_policies/${id}`).catch((error: unknown) => {
            throw new ConnectorError(`Failed to retrieve access policies: ${error}`)
        })

        return true
    }

    async createAccount(user: User): Promise<User> {
        if (!user.principal) {
            throw new ConnectorError(`User principal cannot be null.`)
        }

        // Assing policies for standard roles
        if (user.roles) {
            for (var role of user.roles) {
                if (role.resource && role.role)
                    await this.assignAccessPolicy(user.principal, role.resource, role.role)
            }
        }

        // Assign policies for custom roles
        if (user.custom_roles) {
            for (var crole of user.custom_roles) {
                if (crole.resource && crole.role) {
                    await this.assignAccessPolicy(user.principal, crole.resource, crole.role)
                }
            }
        }

        // Pause for the PAN API to catchup
        await new Promise(f => setTimeout(f, globalThis.__USER_PAUSE));
        // Fetch representation of the user
        let newUser = await this.getAccount(user.principal)
        return newUser
    }

    async updateAccount(account: string, changes: AttributeChange[]): Promise<boolean> {
        changes.forEach(async c => {
            switch (c.op) {
                case AttributeChangeOp.Add:
                    if (c.attribute == 'role' || c.attribute == 'custom_role')
                        await this.assignAccessPolicyFromValue(account, c.value)
                    break
                case AttributeChangeOp.Set:
                    break
                case AttributeChangeOp.Remove:
                    if (c.attribute == 'role' || c.attribute == 'custom_role')
                        await this.deleteAccessPolicyFromValue(account, c.value)
                    break
                default:
                    throw new ConnectorError('Unknown account change op: ' + c.op)
            }
        })
        return true
    }

    async testConnection(): Promise<any> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();

        try {
            const roleList = await httpClient.get('iam/v1/roles/adem_tier_1_support')
            if (roleList.status !== 200) {
                throw new ConnectorError("Unable to connect to Prisma SASE.")
            }
        } catch (err: any) {
            console.log('##### Error name = ' + err.name)
            console.log('##### Error message = ' + err.message)
            if (err.message == 'Request failed with status code 401') {
                console.log('#### Error status = 401')
                let resAuth: any = await auth()
                logger.info(`Auth Status : ${JSON.stringify(resAuth.status)}`)
                httpClient = HTTPFactory.getHTTP();
                let roleList = await httpClient.get('iam/v1/roles/adem_tier_1_support')
            } else {
                console.log('We are about to throw ConnectorError in Test Connection')
                return err.message
            }
        }

        return {}
    }

    async getAllEntitlements(type?: string): Promise<Entitlement[]> {
        let entitlements: Entitlement[] = []
        if (type == 'role') {
            entitlements = await this.getAllRoles()
        } else if (type == 'custom_role') {
            entitlements = await this.getAllCustomRoles()
        }
        return entitlements
    }

    async getAllRoles(): Promise<Entitlement[]> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();
        let entitlements: Entitlement[] = []
        // Get roles
        const responseRoles = await httpClient.get('iam/v1/roles').catch((error: unknown) => {
            throw new ConnectorError(`Failed to retrieve roles: ${error}`)
        })
        var roles = responseRoles.data.items
        for (var role of roles) {
            let entitlement = new Entitlement()
            entitlement.description = role.description
            entitlement.label = role.label
            entitlement.role = role.name
            entitlement.type = 'role'
            entitlement.resource = role.app_id ? 'prn:' + global.__TSGID + ':' + role.app_id + ':::' : 'prn:' + global.__TSGID + '::::'
            entitlement.app_id = role.app_id
            entitlements.push(entitlement)
            if (!role.app_id && rolesRef[role.name].global) {
                console.log(`Role ${role.name} does not have an app_id. Applying globally.`)
                for (var app of applications) {
                    let subEnt = new Entitlement()
                    subEnt.description = role.description
                    subEnt.label = role.label + ' - ' + app.displayName
                    subEnt.role = role.name
                    subEnt.type = 'role'
                    subEnt.resource = 'prn:' + global.__TSGID + ':' + app.name + ':::'
                    subEnt.app_id = app.name
                    entitlements.push(subEnt)
                }
            }
        }
        return entitlements
    }

    async getAllCustomRoles(): Promise<Entitlement[]> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();
        let entitlements: Entitlement[] = []
        // Get custom roles
        const responseCustRoles = await httpClient.get('iam/v1/custom_roles').catch((error: unknown) => {
            throw new ConnectorError(`Failed to retrieve custom roles: ${error}`)
        })
        var custom_roles = responseCustRoles.data.items
        for (var role of custom_roles) {
            let entitlement = new Entitlement()
            entitlement.description = role.description
            entitlement.label = role.label
            entitlement.role = role.name
            entitlement.type = 'custom_role'
            entitlement.resource = role.tsg_id ? 'prn:' + role.tsg_id + ':prima_access:::' : 'prn:' + global.__TSGID + '::::'
            entitlements.push(entitlement)
        }
        return entitlements
    }

    async getEntitlement(identity: string, type: string): Promise<Entitlement> {
        //Check expiration tiem for Bearer toekn in Global variable
        await this.checkTokenValidity()

        let httpClient = HTTPFactory.getHTTP();
        let entitlement = new Entitlement()
        if (type == 'role') {
            const response = await httpClient.get('iam/v1/roles/' + identity).catch((error: unknown) => {
                throw new ConnectorError(`Failed to retrieve roles: ${error}`)
            })
            let role = response.data
            entitlement.description = role.description
            entitlement.label = role.label
            entitlement.role = role.name
            entitlement.type = 'role'
            entitlement.resource = role.app_id ? 'prn:' + global.__TSGID + ':' + role.app_id + ':::' : 'prn:' + global.__TSGID + '::::'
        } else if (type == 'custom_role') {
            const response = await httpClient.get('iam/v1/custom_roles/' + identity).catch((error: unknown) => {
                throw new ConnectorError(`Failed to retrieve custom roles: ${error}`)
            })
            let role = response.data
            entitlement.description = role.description
            entitlement.label = role.label
            entitlement.role = role.name
            entitlement.type = 'role'
            entitlement.resource = role.tsg_id ? 'prn:' + role.tsg_id + ':prima_access:::' : 'prn:' + global.__TSGID + '::::'
        }
        return entitlement
    }
}