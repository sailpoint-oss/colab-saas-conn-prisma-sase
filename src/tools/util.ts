import { ConnectorError, StdAccountCreateInput, StdAccountCreateOutput, StdEntitlementListOutput } from "@sailpoint/connector-sdk";
import { Entitlement } from "../model/entitlement";
import { User } from "../model/user";

export class Util {

    // Utility to convert the suer object to the standard output
    public userToAccount(user: User): StdAccountCreateOutput {
        return {
            identity: user.principal ? user.principal : '',
            uuid: user.principal ? user.principal : '',
            attributes: {
                principal: user.principal ? user.principal : '',
                principal_type: user.principal_type ? user.principal_type : '',
                principal_display_name: user.principal_display_name ? user.principal_display_name : '',
                roles: user.roles ? user.roles.map(entitlement => { return `${entitlement.resource}/${entitlement.role}` }) : null,
                custom_roles: user.custom_roles ? user.custom_roles.map(entitlement => { return `${entitlement.resource}/${entitlement.role}` }) : null,
                hasPANaccount: true,
                
                userAccountId: user.userAccountId ? user.userAccountId : '',
                supportAccountId: user.supportAccountId ? user.supportAccountId : '',
                activationDate: user.activationDate ? user.activationDate : '',
                csp_roles : user.csp_roles ? user.csp_roles.map(entitlement => { return `${entitlement.id}` }) : null,
                hasCSPaccount: user.hasCSPaccount ? user.hasCSPaccount: ''
            }
        }
    }

    // Utility to convert the standard input into a user object
    public accountToUser(input: StdAccountCreateInput): User {
        if (input.attributes.principal == null && input.identity == null) {
            throw new ConnectorError(`'principal' is required to create user`)
        }
        const user = new User()
        const roles: Entitlement[] = []
        const customRoles: Entitlement[] = []
        const cspRoles: Entitlement[] = []

        if (input.attributes['roles'] != null) {
            if (!Array.isArray(input.attributes['roles'])) {
                input.attributes['roles'] = [input.attributes['roles']]
            }

            for (var role of input.attributes['roles']) {
                if (typeof role !== 'string') {
                    throw new ConnectorError('Invalid entitlement type: ' + role)
                }
                var roleParts = role.split('/')
                if (roleParts.length != 2) {
                    throw new ConnectorError('Invalid role format: ' + role)
                }

                var userRole = new Entitlement()
                userRole.resource = roleParts[0]
                userRole.role = roleParts[1]
                roles.push(userRole)
            }
        }
        if (input.attributes['custom_roles'] != null) {
            if (!Array.isArray(input.attributes['custom_roles'])) {
                input.attributes['custom_roles'] = [input.attributes['custom_roles']]
            }

            for (var crole of input.attributes['custom_roles']) {
                if (typeof crole !== 'string') {
                    throw new ConnectorError('Invalid entitlement type for custom role: ' + crole)
                }
                var croleParts = crole.split('/')
                if (croleParts.length != 2) {
                    throw new ConnectorError('Invalid custom role format: ' + crole)
                }

                var userRole = new Entitlement()
                userRole.resource = croleParts[0]
                userRole.role = croleParts[1]
                customRoles.push(userRole)
            }
        }
        if (input.attributes['csp_roles'] != null) {
            if (!Array.isArray(input.attributes['csp_roles'])) {
                input.attributes['csp_roles'] = [input.attributes['csp_roles']]
            }

            for (var role of input.attributes['csp_roles']) {
                if (typeof role !== 'string') {
                    throw new ConnectorError('Invalid csp_roles type: ' + role)
                }

                var userRole = new Entitlement()
                userRole.id = role
                userRole.type = 'csp_role'
                cspRoles.push(userRole)
            }
        }

        user.principal = input.attributes.principal ? input.attributes.principal : input.identity
        user.principal_display_name = input.attributes.principal_display_name
        user.principal_type = input.attributes.principal_type
        user.roles = roles
        user.custom_roles = customRoles
        user.csp_roles = cspRoles
        user.firstName = input.attributes.firstName
        user.lastName = input.attributes.lastName
        user.hasPANaccount = true

        return user
    }

    // Utility to convert an entitlement to a standard output
    public groupToEntitlement(entitlement: Entitlement, type: string): StdEntitlementListOutput {
        if (type == 'csp_role') {
            return {
                identity: entitlement.id,
                uuid: entitlement.id,
                type: entitlement.type ? entitlement.type : 'csp_role',
                attributes: {
                    id: entitlement.id ? entitlement.id : '',
                    name: entitlement.name ? entitlement.name : '',
                    description: entitlement.description ? entitlement.description : '',
                    type: entitlement.type ? entitlement.type : 'csp_role',
                }
            }
        } else {
            return {
                identity: entitlement.resource + '/' + entitlement.role,
                uuid: entitlement.resource + '/' + entitlement.role,
                type: entitlement.type ? entitlement.type : 'role',
                attributes: {
                    id: entitlement.resource + '/' + entitlement.role,
                    role: entitlement.role ? entitlement.role : '',
                    resource: entitlement.resource ? entitlement.resource : '',
                    label: entitlement.label ? entitlement.label : '',
                    description: entitlement.description ? entitlement.description : '',
                    type: entitlement.type ? entitlement.type : '',
                    app_id: entitlement.app_id ? entitlement.app_id : ''
                }
            }
        }

    }
}