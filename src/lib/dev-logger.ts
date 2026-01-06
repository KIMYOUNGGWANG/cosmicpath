/**
 * Development-only logger utility.
 * In production, all logs are suppressed.
 */
const isDev = process.env.NODE_ENV === 'development';

export const devLog = {
    log: (...args: unknown[]) => isDev && console.log(...args),
    warn: (...args: unknown[]) => isDev && console.warn(...args),
    error: (...args: unknown[]) => console.error(...args), // Always log errors
    info: (...args: unknown[]) => isDev && console.info(...args),
};

export default devLog;
