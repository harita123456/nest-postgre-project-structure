type LogLevel = "info" | "warn" | "error" | "debug" | "trace" | "verbose";

const colors: Record<LogLevel, (msg: string) => string> = {
  error: (msg) => `\x1b[31m${msg}\x1b[0m`,
  warn: (msg) => `\x1b[33m${msg}\x1b[0m`,
  info: (msg) => `\x1b[32m${msg}\x1b[0m`,
  debug: (msg) => `\x1b[34m${msg}\x1b[0m`,
  trace: (msg) => `\x1b[90m${msg}\x1b[0m`,
  verbose: (msg) => `\x1b[35m${msg}\x1b[0m`,
};

interface LogMeta {
  [key: string]: unknown;
}

const format = (level: LogLevel, message: string | object, meta?: LogMeta) => {
  const msg = typeof message === "string" ? message : JSON.stringify(message, null, 2);
  const metaStr = meta ? ` ${JSON.stringify(meta, null, 2)}` : "";
  const colorize = colors[level] || ((m: string) => m);
  return `${colorize(msg)}${metaStr}`;
};

export const log = (level: LogLevel, message: string | object, meta?: LogMeta): void => {
  const line = format(level, message, meta);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

const extractErrorDetails = (error: unknown): string => {
  if (error instanceof Error) return `${error.name}: ${error.message}\nStack: ${error.stack}`;
  try { return `Unknown error: ${JSON.stringify(error, null, 2)}`; } catch { return String(error); }
};

export const logError = (message: string, error: unknown): void => {
  console.error(format("error", `${message}: ${extractErrorDetails(error)}`));
};

export const logInfo = (message: string | object) => console.log(format("info", message));
export const logData = (...messages: unknown[]) => console.log(format("debug", messages.map(m => typeof m === "object" ? JSON.stringify(m, null, 2) : String(m)).join(" ")));
export const logWarn = (message: string | object) => console.warn(format("warn", message));
export const logErrorConsole = (message: string | object, error?: unknown) => {
  console.error(format("error", message));
  if (error) console.error(format("error", extractErrorDetails(error)));
};
