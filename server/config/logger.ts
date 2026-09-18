import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Process-wide structured logger.
 *
 * - JSON by default so Render's log drain can index it.
 * - Credentials never enter the log stream: authorization headers, cookies and
 *   password fields are redacted before serialization.
 * - `LOG_LEVEL` overrides the environment default (trace|debug|info|warn|error).
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  base: undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'req.body.password',
      'req.body.currentPassword',
      'req.body.newPassword',
      'err.config.headers.authorization',
      '*.password',
    ],
    censor: '[REDACTED]',
  },
});

export function logError(message: string, error: unknown) {
  logger.error({ err: error instanceof Error ? { message: error.message } : error }, message);
}
