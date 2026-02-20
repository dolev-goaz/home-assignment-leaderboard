import winston from "winston";
import { JsonFormat } from "./formats/json";
import { ConsoleFormat } from "./formats/console";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

function getLoggingFormat() {
    if (process.env.IS_LOCAL === "true") {
        return ConsoleFormat;
    }
    return JsonFormat;
}

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "prod" ? "info" : "debug",
    transports: [
        new winston.transports.Console({
            format: getLoggingFormat(),
        }),
    ],
});
