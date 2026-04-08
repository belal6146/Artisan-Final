"use server";

import * as lib from "@/backend/lib/notifications";

export interface CreateNotificationOptions {
    userId: string;
    type: 'event_rsvp' | 'artwork_purchase' | 'support' | 'system';
    title: string;
    message: string;
    emailTo?: string;
}

export async function createNotification(options: CreateNotificationOptions) {
    return lib.createNotification(
        options.userId,
        options.type as any,
        options.title + ": " + options.message,
        {},
        options.emailTo
    );
}

export async function onWorkshopRSVP(attendeeId: string, eventId: string) {
    return lib.onWorkshopRSVP(attendeeId, eventId);
}

export async function onArtworkPurchase(buyerId: string, artworkId: string) {
    return lib.onArtworkPurchase(buyerId, artworkId);
}
