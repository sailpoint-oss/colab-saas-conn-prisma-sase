// Model to represent  an accees policy
export class AccessPolicy {
    id?: string
    inherited_from?: string
    role?: string
    principal?: string
    resource?: string
    principal_type?: string
    principal_display_name?: string
}