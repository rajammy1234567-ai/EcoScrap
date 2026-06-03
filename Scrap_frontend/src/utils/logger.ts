// Simple production-ready logger that disables logs in production
export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (__DEV__) console.error(...args);
  },
  info: (...args: any[]) => {
    if (__DEV__) console.info(...args);
  },
};
