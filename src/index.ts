import { verifyEnvVariables } from "./env";
import { startServer } from "./app";
import { initializeDBConnection } from "./services/database";
import { logger } from "@/services/logging";

import dotenv from "dotenv";
dotenv.config({ quiet: true });

async function setup() {
    verifyEnvVariables();
    await Promise.all([initializeDBConnection(), startServer()]);
}

setup().catch((err) => {
    let innerLogger = logger.child({ operation: "application_setup" });
    if (err instanceof Error) {
        innerLogger = logger.child({
            stack: err.stack,
            message: err.message,
            name: err.name,
        });
    }
    innerLogger.error("Application setup failed");
    process.exit(1);
});
