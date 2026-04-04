/**
 * ARTISAN UNIFIED LOGGING SYSTEM
 * Standardized for World-Class Operational Rigor.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type EventCategory = 
    | 'AUTH' | 'USER' | 'ARTWORK' | 'EVENT' | 'COLLAB' | 'SECURITY' | 'SYSTEM' | 'COMMERCE';

export type EventName = 
    | 'AUTH_LOGIN_START' | 'AUTH_LOGIN_SUCCESS' | 'AUTH_LOGIN_FAILURE' | 'AUTH_LOGOUT' | 'AUTH_SESSION_RESTORED'
    | 'USER_CREATE_START' | 'USER_CREATE_SUCCESS' | 'USER_CREATE_FAILURE'
    | 'USER_UPDATE_START' | 'USER_UPDATE_SUCCESS' | 'USER_UPDATE_FAILURE'
    | 'PROFILE_UPDATE_START' | 'PROFILE_UPDATE_SUCCESS' | 'PROFILE_UPDATE_FAILURE'
    | 'ARTWORK_CREATE_START' | 'ARTWORK_CREATE_SUCCESS' | 'ARTWORK_CREATE_FAILURE'
    | 'ARTWORK_UPDATE_START' | 'ARTWORK_UPDATE_SUCCESS' | 'ARTWORK_UPDATE_FAILURE'
    | 'ARTWORK_DELETE_START' | 'ARTWORK_DELETE_SUCCESS' | 'ARTWORK_DELETE_FAILURE'
    | 'ARTWORK_FETCH_SUCCESS' | 'ARTWORK_FETCH_FAILED'
    | 'EVENT_CREATE_START' | 'EVENT_CREATE_SUCCESS' | 'EVENT_CREATE_FAILURE'
    | 'EVENT_UPDATE_START' | 'EVENT_UPDATE_SUCCESS' | 'EVENT_UPDATE_FAILURE'
    | 'EVENT_FETCH_SUCCESS' | 'EVENT_FETCH_FAILED'
    | 'RSVP_CREATE_START' | 'RSVP_CREATE_SUCCESS' | 'RSVP_CREATE_FAILURE'
    | 'COLLAB_CREATE_START' | 'COLLAB_CREATE_SUCCESS' | 'COLLAB_CREATE_FAILURE'
    | 'COLLAB_FETCH_SUCCESS' | 'COLLAB_FETCH_FAILED'
    | 'COLLAB_INTEREST_START' | 'COLLAB_INTEREST_SUCCESS' | 'COLLAB_INTEREST_FAILURE'
    | 'JOURNAL_CREATE_START' | 'JOURNAL_CREATE_SUCCESS' | 'JOURNAL_CREATE_FAILURE'
    | 'JOURNAL_FETCH_SUCCESS' | 'JOURNAL_FETCH_FAILED'
    | 'PAYMENT_PROCESS_START' | 'PAYMENT_PROCESS_SUCCESS' | 'PAYMENT_PROCESS_FAILURE'
    | 'PERMISSION_DENIED' | 'VALIDATION_FAILURE' | 'SECURITY_VIOLATION'
    | 'COMMERCE_CHECKOUT_START' | 'COMMERCE_CHECKOUT_SUCCESS' | 'COMMERCE_CHECKOUT_FAILURE' | 'COMMERCE_PAYMENT_FAILED'
    | 'SYSTEM_EMAIL_SENT' | 'SYSTEM_EMAIL_FAILED'
    | 'SYSTEM_START' | 'SYSTEM_SUCCESS' | 'SYSTEM_FAILURE'
    | 'SYSTEM_ERROR' | 'UNEXPECTED_CONDITION';

export interface LogContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    route?: string;
    source: 'frontend' | 'backend';
    [key: string]: unknown;
}

class Logger {
    private isDev = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, event: EventName, context: LogContext) {
        const timestamp = new Date().toISOString();
        
        // Simple serialization without manual loop - let JSON handle standard objects
        // and only explicitly format Error if present to avoid "clever" processing.
        const logEntry = {
            timestamp,
            level,
            event,
            ...context,
            error: context.error instanceof Error ? {
                message: context.error.message,
                name: context.error.name,
                stack: context.error.stack
            } : context.error
        };

        if (this.isDev) {
            const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
            console[level](
                `${color}[${level.toUpperCase()}] ${event}\x1b[0m`,
                JSON.stringify(logEntry, null, 2)
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
