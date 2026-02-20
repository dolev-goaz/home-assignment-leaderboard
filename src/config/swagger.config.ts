import type { SwaggerOptions } from "@fastify/swagger";
import type { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

export const swaggerUIConfig = {
  routePrefix: "/docs",
  theme: {
    title: "Leaderboards Endpoint Docs",
  },
} satisfies FastifySwaggerUiOptions;

export const swaggerConfig = {
  swagger: {
    info: {
      title: "Leaderboards Endpoint Docs",
      version: "1.0.0",
      description: "API documentation for the Leaderboards Endpoint",
    },
  },
} satisfies SwaggerOptions;
