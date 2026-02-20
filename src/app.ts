import Fastify, { type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimiter from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import helmetConfig from "@/config/helmet.config";
import rateLimiterConfig from "@/config/rate-limit.config";
import { swaggerConfig, swaggerUIConfig } from "@/config/swagger.config";

import { errorHandler } from "@/errors/ErrorHandler.error";
import { errorHookhandler } from "@/errors/ErrorHookHandler.error";

import { logger } from "@/services/logging";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

function addCacheInvalidationHeaders(app: FastifyInstance) {
    app.addHook("onSend", async (req, reply, payload) => {
        reply
            .header("Cache-Control", "no-cache, no-store, must-revalidate")
            .header("Pragma", "no-cache")
            .header("Expires", "0");
        return payload;
    });
}

async function createServer() {
    const app = Fastify({ logger: false });
    await app.register(helmet, helmetConfig);
    await app.register(rateLimiter, rateLimiterConfig);
    if (process.env.IS_LOCAL === "true") {
        await app.register(swagger, swaggerConfig);
        await app.register(swaggerUi, swaggerUIConfig);
    }

    // docs on https://fastify.dev/docs/v5.0.x/Reference/Server/#seterrorhandler
    app.setErrorHandler(errorHandler);
    app.addHook("onError", errorHookhandler);

    addCacheInvalidationHeaders(app);

    // ======= routes =======
    await app.register(
        (instance, _opts, next) => {
            instance.get("/health", async () => {
                logger.child({ route: "health" }).info("Health check endpoint called");
                return { status: "ok" };
            });
            next();
        },
        { prefix: "/api/v1" },
    );
    return app;
}

export async function startServer() {
    try {
        const app = await createServer();
        await app.listen({
            port: parseInt(process.env.APP_PORT),
            host: "0.0.0.0",
        });
        logger.child({ port: process.env.APP_PORT }).info("Server started successfully");
    } catch (err) {
        if (err instanceof Error) {
            logger
                .child({
                    stack: err.stack,
                    message: err.message,
                    name: err.name,
                })
                .error("Error starting server");
        }
        logger.error("Failed to start server");
        throw err;
    }
}
