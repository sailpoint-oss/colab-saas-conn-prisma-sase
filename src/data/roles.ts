export type RoleSource = {
    name: string
    label: string
    app_id?: string
    global?: boolean
}

/*
 *  Roles built into Prisma Access
 *      global: Builds entitlement version for each application.
 */

export const rolesRef: Record<string, RoleSource> = {
    adem_tier_1_support: {
        name: 'adem_tier_1_support',
        label: 'ADEM Tier 1 Support',
        app_id: 'prisma_access',
        global: false
    },
    auditor: {
        name: 'auditor',
        label: 'Auditor',
        global: false
    },
    browser: {
        name: 'browser',
        label: 'Browser',
        global: false
    },
    business_admin: {
        name: 'business_admin',
        label: 'Business Administrator',
        global: false
    },
    data_security_admin: {
        name: 'data_security_admin',
        label: 'Data Security Administrator',
        global: false
    },
    deployment_admin: {
        name: 'deployment_admin',
        label: 'Deployment Administrator',
        global: false
    },
    dlp_incident_admin: {
        name: 'dlp_incident_admin',
        label: 'DLP Incident Administrator',
        app_id: 'dlp',
        global: false
    },
    dlp_policy_admin: {
        name: 'dlp_policy_admin',
        label: 'DLP Policy Administrator',
        app_id: 'dlp',
        global: false
    },
    iam_admin: {
        name: 'iam_admin',
        label: 'IAM Administrator',
        global: false
    },
    msp_iam_admin: {
        name: 'msp_iam_admin',
        label: 'Multitenant IAM Administrator',
        global: false
    },
    msp_superuser: {
        name: 'msp_superuser',
        label: 'Multitenant Superuser',
        global: false
    },
    mt_manage_user: {
        name: 'mt_manage_user',
        label: 'Multitenant Manage User',
        global: false
    },
    mt_monitor_user: {
        name: 'mt_monitor_user',
        label: 'Multitenant Monitor User',
        global: false
    },
    network_admin: {
        name: 'network_admin',
        label: 'Network Administrator',
        global: false
    },
    project_admin: {
        name: 'project_admin',
        label: 'Project Admin',
        app_id: 'prisma_access',
        global: false
    },
    project_admin_push: {
        name: 'project_admin_push',
        label: 'Project Admin Push',
        app_id: 'prisma_access',
        global: false
    },
    seb_access_and_data_admin: {
        name: 'seb_access_and_data_admin',
        label: 'PA Browser Access & Data Administrator',
        app_id: 'seb',
        global: false
    },
    seb_customization_admin: {
        name: 'seb_customization_admin',
        label: 'PA Browser Customization Administrator',
        app_id: 'seb',
        global: false
    },
    seb_permission_request_admin: {
        name: 'seb_permission_request_admin',
        label: 'PA Browser Permission Request Administrator',
        app_id: 'seb',
        global: false
    },
    seb_security_admin: {
        name: 'seb_security_admin',
        label: 'PA Browser Security Administrator',
        app_id: 'seb',
        global: false
    },
    seb_security_and_posture_admin: {
        name: 'seb_security_and_posture_admin',
        label: 'PA Browser Security & Device Posture Administrator',
        app_id: 'seb',
        global: false
    },
    seb_view_only_analytics_admin: {
        name: 'seb_view_only_analytics_admin',
        label: 'PA Browser View Only Analytics',
        app_id: 'seb',
        global: false
    },
    security_admin: {
        name: 'security_admin',
        label: 'Security Administrator',
        global: false
    },
    soc_admin: {
        name: 'soc_admin',
        label: 'SaaS SOC Administrator',
        app_id: 'ng_casb',
        global: false
    },
    soc_analyst: {
        name: 'soc_analyst',
        label: 'SOC Analyst',
        global: false
    },
    sspm_appowner_superuser: {
        name: 'sspm_appowner_superuser',
        label: 'SaaS Posture Security Administrator',
        app_id: 'ng_casb',
        global: false
    },
    superuser: {
        name: 'superuser',
        label: 'Superuser',
        global: true
    },
    tier_1_support: {
        name: 'tier_1_support',
        label: 'Tier 1 Support',
        global: false
    },
    tier_2_support: {
        name: 'tier_2_support',
        label: 'Tier 2 Support',
        global: false
    },
    view_only_admin: {
        name: 'view_only_admin',
        label: 'View Only Administrator',
        global: true
    },
    web_security_admin: {
        name: 'web_security_admin',
        label: 'Web Security Admin',
        app_id: 'prisma_access',
        global: false
    }
}