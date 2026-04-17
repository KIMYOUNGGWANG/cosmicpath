/**
 * Development-only logger utility.
 * In production, all logs are suppressed.
 */
const isDev = process.env.NODE_ENV === 'development';
const isVerboseDev = isDev && ['1', 'true', 'yes', 'on'].includes(
    (process.env.COSMICPATH_VERBOSE_DEV_LOGS ?? '').toLowerCase()
);

export const devLog = {
    log: (...args: unknown[]) => isVerboseDev && console.log(...args),
    warn: (...args: unknown[]) => isDev && console.warn(...args),
    error: (...args: unknown[]) => console.error(...args), // Always log errors
    info: (...args: unknown[]) => isVerboseDev && console.info(...args),
};

export default devLog;
