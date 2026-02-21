import { verifyEnvVariables } from "./env";
import { startServer } from "./app";
import { initializeDBConnection } from "./services/database";
import { logger } from "@/services/logging";
import {
    initializeLeaderboardManager,
    getLeaderboardManager,
} from "@/route-services/leaderboards.service";
import { ReadUser } from "@/dal/user";
import { userToDTO } from "@/dto/user";

import dotenv from "dotenv";
dotenv.config({ quiet: true });

async function loadExistingUsers() {
    const users = await ReadUser.getAllUsers();
    const usersDTO = users.map(userToDTO);
    getLeaderboardManager().loadUsers(usersDTO);
}

async function setup() {
    verifyEnvVariables();
    initializeLeaderboardManager();
    await Promise.all([startServer(), initializeDBConnection().then(loadExistingUsers)]);
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
