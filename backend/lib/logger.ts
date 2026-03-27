export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogPayload {
    message: string
    [key: string]: unknown
}

const isDev = process.env.NODE_ENV === 'development'

class Logger {
    private log(level: LogLevel, payload: LogPayload) {
        const timestamp = new Date().toISOString()
        const logEntry = {
            timestamp,
            level,
            ...payload,
        }

        // In a real app, you might send this to a service like Datadog or Sentry
        if (isDev) {
            const { message, ...context } = payload;
            if (Object.keys(context).length > 0) {
                console[level](`[${level.toUpperCase()}] ${message}`, context);
            } else {
                console[level](`[${level.toUpperCase()}] ${message}`);
            }
        } else {
            console[level](JSON.stringify(logEntry))
        }
    }

    info(message: string, context?: Record<string, unknown>) {
        this.log('info', { message, ...context })
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', { message, ...context })
    }

    error(message: string, context?: Record<string, unknown>) {
        this.log('error', { message, ...context })
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.log('debug', { message, ...context })
    }
}

export const logger = new Logger()
