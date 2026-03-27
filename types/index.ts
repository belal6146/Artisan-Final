export interface User {
    uid: string
    displayName: string | null
    email: string | null
    photoURL: string | null
    role: 'artist' | 'client' | 'observer'
    createdAt: string
    bio?: string
    location?: string
    transactions?: {
        id: string
        type: 'buy' | 'sell' | 'rent'
        itemId: string
        itemTitle: string
        amount: number
        currency: string
        date: string
    }[]
}

export interface ArtistProfile {
    uid: string
    bio: string
    skills: string[]
    portfolio: string[] // URLs
    location?: string
    processJournalEnabled: boolean
}

export interface CollaborationPost {
    id: string
    title: string
    description: string
    budgetRange: string
    location: string
    isRemote: boolean
    createdBy: string
    createdAt: string
    status: 'open' | 'closed' | 'filled'
}
