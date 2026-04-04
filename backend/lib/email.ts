
import { logger } from "@/backend/lib/logger";

export interface EmailOptions {
    to: string;
    subject: string;
    body: string;
    templateData?: any;
}

/**
 * 📧 Artisan Email Engine (Simulator Mode)
 * In production, this would use SendGrid, Mailgun, or Amazon SES.
 * Currently configured to simulate delivery for verification.
 */
export async function sendEmail({ to, subject, body }: EmailOptions) {
    // SIMULATE SUCCESS
    logger.info('SYSTEM_EMAIL_SENT', { to, subject, source: 'backend' });
    return { success: true, messageId: `SIM-${Math.random().toString(36).substring(7)}` };
}

/**
 * Pre-formatted templates for platform events
 */
export const emailTemplates = {
    rsvpConfirmation: (userName: string, eventTitle: string) => ({
        subject: `Confirmed: Your spot at ${eventTitle}`,
        body: `Hi ${userName},\n\nYour spot is secured! We're excited to have you join us for "${eventTitle}".\n\nCheck your Artisan Profile for event details and location updates.`
    }),
    organizerAlert: (organizerName: string, attendeeName: string, eventTitle: string) => ({
        subject: `New Artisan Registration: ${eventTitle}`,
        body: `Hi ${organizerName},\n\n${attendeeName} just registered for your workshop "${eventTitle}".\n\nYour dashboard has been updated with the new attendee details.`
    })
};
