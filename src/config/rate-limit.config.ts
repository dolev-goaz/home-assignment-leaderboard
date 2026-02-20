import type { RateLimitOptions } from "@fastify/rate-limit";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const MINUTE_MS = 60 * 1000;

// Use higher limits for local development and dev environment
const isDevelopment = process.env.NODE_ENV === "dev";

export const rateLimiterConfig = {
  max: isDevelopment ? 10000 : 300,
  timeWindow: 5 * MINUTE_MS,
  allowList: ["127.0.0.6"],
  errorResponseBuilder: (_req, context) => {
    return {
      statusCode: 429,
      error: "Too many requests from this IP, please try again after a break",
      expiresIn: context.ttl,
    };
  },
} satisfies RateLimitOptions;

export default rateLimiterConfig;
