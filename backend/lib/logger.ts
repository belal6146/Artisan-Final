/**
 * Artisan Logging — structured, minimal, consistent.
 * All runtime logs must use this logger. No raw console calls in production code.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type EventName =
    // Auth
    | 'AUTH_LOGIN_START' | 'AUTH_LOGIN_SUCCESS' | 'AUTH_LOGIN_FAILURE' | 'AUTH_LOGOUT' | 'AUTH_SESSION_RESTORED' | 'AUTH_INITIALIZATION_ERROR'
    // User / Profile
    | 'USER_CREATE_START' | 'USER_CREATE_SUCCESS' | 'USER_CREATE_FAILURE'
    | 'USER_UPDATE_START' | 'USER_UPDATE_SUCCESS' | 'USER_UPDATE_FAILURE'
    | 'USER_FETCH_SUCCESS' | 'USER_FETCH_FAILED'
    // Artwork
    | 'ARTWORK_CREATE_START' | 'ARTWORK_CREATE_SUCCESS' | 'ARTWORK_CREATE_FAILURE'
    | 'ARTWORK_UPDATE_START' | 'ARTWORK_UPDATE_SUCCESS' | 'ARTWORK_UPDATE_FAILURE'
    | 'ARTWORK_DELETE_START' | 'ARTWORK_DELETE_SUCCESS' | 'ARTWORK_DELETE_FAILURE'
    | 'ARTWORK_FETCH_SUCCESS' | 'ARTWORK_FETCH_FAILED'
    // Events
    | 'EVENT_CREATE_START' | 'EVENT_CREATE_SUCCESS' | 'EVENT_CREATE_FAILURE'
    | 'EVENT_UPDATE_START' | 'EVENT_UPDATE_SUCCESS' | 'EVENT_UPDATE_FAILURE'
    | 'EVENT_FETCH_SUCCESS' | 'EVENT_FETCH_FAILED'
    // RSVPs
    | 'RSVP_CREATE_START' | 'RSVP_CREATE_SUCCESS' | 'RSVP_CREATE_FAILURE'
    | 'RSVP_FETCH_SUCCESS' | 'RSVP_FETCH_FAILED'
    // Collaborations
    | 'COLLAB_CREATE_START' | 'COLLAB_CREATE_SUCCESS' | 'COLLAB_CREATE_FAILURE'
    | 'COLLAB_FETCH_SUCCESS' | 'COLLAB_FETCH_FAILED'
    | 'COLLAB_INTEREST_START' | 'COLLAB_INTEREST_SUCCESS' | 'COLLAB_INTEREST_FAILURE'
    // Journal
    | 'JOURNAL_CREATE_START' | 'JOURNAL_CREATE_SUCCESS' | 'JOURNAL_CREATE_FAILURE'
    | 'JOURNAL_FETCH_SUCCESS' | 'JOURNAL_FETCH_FAILED'
    // Commerce / Payments
    | 'PAYMENT_START' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILURE'
    | 'COMMERCE_CHECKOUT_START' | 'COMMERCE_CHECKOUT_SUCCESS' | 'COMMERCE_CHECKOUT_FAILURE'
    // Security
    | 'PERMISSION_CHECK' | 'PERMISSION_DENIED' | 'SECURITY_VIOLATION'
    | 'SYSTEM_EMAIL_SENT' | 'SYSTEM_EMAIL_FAILED'
    | 'NOTIFICATION_CREATE_SUCCESS'
    | 'SYSTEM_ERROR' | 'SYSTEM_START' | 'SYSTEM_SUCCESS' | 'SYSTEM_FAILURE';

export interface LogContext {
    userId?: string;
    source: 'frontend' | 'backend';
    [key: string]: unknown;
}

class Logger {
    private isDev = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, event: EventName, context: LogContext) {
        const timestamp = new Date().toISOString();
        
        const errorDetail = context.error instanceof Error ? {
            message: context.error.message,
            stack: context.error.stack,
            code: (context.error as any).code
        } : context.error;

        const logEntry = {
            timestamp,
            level,
            event,
            ...context,
            error: errorDetail
        };

        if (this.isDev) {
            const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
            console[level](
                `${color}[${level.toUpperCase()}] ${event}\x1b[0m`,
                logEntry
            );
        } else {
            console[level](JSON.stringify(logEntry));
        }
    }

    info(event: EventName, context: LogContext) {
        this.log('info', event, context);
    }

    warn(event: EventName, context: LogContext) {
        this.log('warn', event, context);
    }

    error(event: EventName, context: LogContext) {
        this.log('error', event, context);
    }

    debug(event: EventName, context: LogContext) {
        if (this.isDev) {
            this.log('debug', event, context);
        }
    }
}

export const logger = new Logger();
