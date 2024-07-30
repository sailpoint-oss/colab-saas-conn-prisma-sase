import { Entitlement } from "./entitlement";

// This class represents a user object and its properties.

export class User {
    principal?: string;
    principal_type?: string
    principal_display_name?: string
    roles?: Entitlement[]
    custom_roles?: Entitlement[]
}