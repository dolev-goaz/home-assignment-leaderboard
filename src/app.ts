import Fastify from "fastify";
import { logger } from "@/services/logging";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const fastify = Fastify({ logger: false });

fastify.get("/health", async () => {
  logger.child({ route: "health" }).info("Health check endpoint called");
  return { status: "ok" };
});

export async function startServer() {
  try {
    await fastify.listen({
      port: parseInt(process.env.APP_PORT),
      host: "0.0.0.0",
    });
    logger
      .child({ port: process.env.APP_PORT })
      .info("Server started successfully");
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
