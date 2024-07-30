export type ApplicationSource = {
    name: string
    displayName: string
}

// Representation of the Prisma SASE applications

export const applications: ApplicationSource[] = [
    {
        name: 'directory_sync',
        displayName: 'Cloud Identity Engine'
    },
    {
        name: 'seb',
        displayName: 'Prisma Access Browser'
    },
    {
        name: 'logging_service',
        displayName: 'Strata Logging Service'
    },
    {
        name: 'dlp',
        displayName: 'Enterprise DLP'
    },
    {
        name: 'zingbox',
        displayName: 'IoT Security'
    },
    {
        name: 'strata_insights',
        displayName: 'AIOps for NGFW'
    },
    {
        name: 'strata_insights_free',
        displayName: 'AIOps for NGFW Free'
    },
    {
        name: 'ng_casb',
        displayName: 'Next-Generation CASB'
    },
    {
        name: 'prisma_access',
        displayName: 'Prisma Access & NGFW Configuration'
    },
    {
        name: 'cgx',
        displayName: 'Prisma SD-WAN'
    }
]
