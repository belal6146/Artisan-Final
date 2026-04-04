
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
    logger.info("📧 [EMAIL SIMULATOR] Attempting to send email...", { to, subject });

    // In a real production environment, we'd call the mail provider API here:
    // const response = await mailProvider.send({ to, from: 'no-reply@artisan.com', subject, text: body });

    // MOCK DELAY (to simulate network)
    await new Promise(resolve => setTimeout(resolve, 800));

    // LOG TO CONSOLE (For User Verification)
    console.log(`
      ╔════════════════════════════════════════════════════════════════════════════════
      ║ 📧 EMAIL SENT (SIMULATED)
      ╠════════════════════════════════════════════════════════════════════════════════
      ║ To:      ${to}
      ║ Subject: ${subject}
      ║
      ║ ${body}
      ╚════════════════════════════════════════════════════════════════════════════════
    `);

    logger.info("📧 [EMAIL SIMULATOR] Email successfully 'delivered'.", { to });
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
