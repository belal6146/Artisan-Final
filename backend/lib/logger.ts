/**
 * ARTISAN UNIFIED LOGGING SYSTEM
 * Standardized for World-Class Operational Rigor.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type EventCategory = 
    | 'AUTH' | 'USER' | 'ARTWORK' | 'EVENT' | 'COLLAB' | 'SECURITY' | 'SYSTEM' | 'COMMERCE';

export type EventName = 
    | 'AUTH_LOGIN_STARTED' | 'AUTH_LOGIN_SUCCESS' | 'AUTH_LOGIN_FAILURE' | 'AUTH_LOGOUT' | 'AUTH_SESSION_RESTORED'
    | 'USER_RECORD_CREATED' | 'USER_RECORD_UPDATED' | 'USER_PROFILE_UPDATED' | 'ARTIST_PROFILE_CREATED' | 'ARTIST_PROFILE_UPDATED'
    | 'ARTWORK_UPLOAD_STARTED' | 'ARTWORK_UPLOAD_SUCCESS' | 'ARTWORK_UPLOAD_FAILURE' | 'ARTWORK_VISIBILITY_CHANGED'
    | 'ARTWORK_FETCH_SUCCESS' | 'ARTWORK_FETCH_FAILED'
    | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_CANCELED' | 'EVENT_FETCH_SUCCESS' | 'EVENT_FETCH_FAILED'
    | 'EVENT_RSVP_CREATED' | 'EVENT_RSVP_CANCELED' | 'EVENT_RSVP_FAILURE'
    | 'COLLAB_POST_CREATED' | 'COLLAB_POST_UPDATED' | 'COLLAB_POST_FLAGGED' | 'COLLAB_INTEREST_SUBMITTED'
    | 'JOURNAL_ENTRY_CREATED' | 'JOURNAL_ENTRY_UPDATED' | 'JOURNAL_FETCH_SUCCESS' | 'JOURNAL_FETCH_FAILED'
    | 'PERMISSION_DENIED' | 'RATE_LIMIT_TRIGGERED' | 'RULE_VIOLATION_ATTEMPT' | 'CONTENT_FLAGGED'
    | 'COMMERCE_CHECKOUT_STARTED' | 'COMMERCE_CHECKOUT_SUCCESS' | 'COMMERCE_ACQUISITION_SUCCESS' | 'COMMERCE_PAYMENT_FAILED'
    | 'SYSTEM_EMAIL_SENT' | 'SYSTEM_EMAIL_FAILED'
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
        
        // Robust Error Serialization: Ensure everything is machine-readable
        const processedContext = { ...context };
        Object.keys(processedContext).forEach(key => {
            const val = processedContext[key];
            if (val && typeof val === 'object') {
                // Handle Error-like objects including Firestore/Custom errors
                if ('message' in val || 'stack' in val || val instanceof Error) {
                    const errorObj = val as any;
                    processedContext[key] = {
                        message: errorObj.message || 'Unknown Error',
                        stack: errorObj.stack || 'No Stack Trace',
                        name: errorObj.name || (errorObj.code ? `Error[${errorObj.code}]` : 'InternalError'),
                        code: errorObj.code || 'UNKNOWN'
                    };
                }
            }
        });

        const logEntry = {
            timestamp,
            level,
            event,
            ...processedContext,
        };

        if (this.isDev) {
            const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
            console[level](
                `${color}[${level.toUpperCase()}] ${event}\x1b[0m`,
                JSON.stringify({ ...processedContext, timestamp }, null, 2)
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
