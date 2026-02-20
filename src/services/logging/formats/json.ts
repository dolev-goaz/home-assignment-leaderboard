import { format } from "winston";

function getTimestamp(timestamp?: unknown): string {
    let dateObject: Date;
    if (typeof timestamp === "string") {
        dateObject = new Date(timestamp);
    } else if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        dateObject = timestamp;
    } else {
        dateObject = new Date();
    }
    return dateObject.toISOString();
}
export const JsonFormat = format.combine(
    format((info) => {
        const structured = {
            "@timestamp": getTimestamp(info.timestamp),
            level: info.level,
            message: info.message,

            // Remove already structured fields from root
            ...Object.fromEntries(
                Object.entries(info).filter(
                    ([key]) => !["timestamp", "level", "message"].includes(key),
                ),
            ),
        };

        return structured;
    })(),
    format.json(),
);
