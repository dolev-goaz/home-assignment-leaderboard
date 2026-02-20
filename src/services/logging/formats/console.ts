import winston from "winston";
const { combine, timestamp, colorize, printf } = winston.format;

function formatObject(object: any): string {
  if (object == null || typeof object != "object") return "";
  object = { ...object }; // dont mutate original object
  delete object["meta"]; // delete logging metadata
  if (Object.keys(object as object).length == 0) return "";
  return JSON.stringify(object, null, 4);
}
function formatMessage(object: any): string {
  if (object == null || typeof object !== "object") return String(object);
  const objStr = formatObject(object);
  return objStr ? `\n${objStr}` : "";
}
function formatArgs(object: unknown): string {
  if (object == null || typeof object != "object") return "";

  if (Object.keys(object).length == 0) return "";
  const objStr = formatObject(object);
  return objStr ? `\n${objStr}` : "";
}

const logFormat = printf(({ level, message, timestamp, ...args }) => {
  const messageStr = formatMessage(message);
  const argsStr = formatArgs(args);

  timestamp = String(timestamp).split(" ")[1]; // get time part only
  const components = [timestamp, `[${level}]`, messageStr, argsStr].filter(
    Boolean,
  );
  return components.join(" ");
});

const joinedFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  logFormat,
);
const filterDatabaseOperations = winston.format((info) => {
  // Skip database operation logs
  if (info?.utilityService === "database-operations") {
    return false;
  }
  return info;
});

// ignore database operations logs in development
export const ConsoleFormat = combine(filterDatabaseOperations(), joinedFormat);
