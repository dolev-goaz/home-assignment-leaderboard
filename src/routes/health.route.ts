import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifySchema } from "fastify";
import { logger as baseLogger } from "@/services/logging";

const tags = ["Server Health"];

const schemas = {
    health: {
        tags,
        description: "Check if the server is running and healthy",
    },
} satisfies Record<string, FastifySchema>;

const route: FastifyPluginAsyncTypebox = async (app) => {
    const logger = baseLogger.child({ route: "health" });
    app.get("/health", { schema: schemas.health }, async () => {
        logger.info("Health check endpoint called");
        return { status: "ok" };
    });
};

export default route;
