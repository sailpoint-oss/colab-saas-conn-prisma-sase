import { Entitlement } from "./entitlement";

// This class represents a user object and its properties.

export class User {
    principal?: string;
    principal_type?: string
    principal_display_name?: string
    roles?: Entitlement[]
    custom_roles?: Entitlement[]
    hasPANaccount?: boolean

    // CSP fields
    userAccountId?: number
    supportAccountId?: number
    activationDate?: string
    csp_roles?: Entitlement[]
    hasCSPaccount?: boolean
    firstName?: string
    lastName?: string
}