import { z } from "zod";
import { logger } from "@/services/logging";

const envVariables = z.object({
    NODE_ENV: z.enum(["dev", "prod"]).optional().default("dev"),
    APP_PORT: z.string().regex(/\d+/).default("3000"),
    IS_LOCAL: z.literal("true").optional(),

    // database variables
    DB_HOST: z.string().optional(),
    DB_PORT: z.string(),
    DB_NAME: z.string(),
    DB_SCHEMA: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
});

/**
 * Verifies that the environment variables match
 * the declared format.
 */
export function verifyEnvVariables() {
    try {
        envVariables.parse(process.env);
    } catch (e) {
        if (e instanceof z.ZodError) {
            logger
                .child({
                    operation: "environment_variables_verification",
                    issues: e.issues,
                })
                .error("Environment variables validation failed");
        } else {
            logger
                .child({
                    operation: "environment_variables_verification",
                    error: e,
                })
                .error("Environment variables validation encountered an unexpected error");
        }
        process.exit(1);
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envVariables> {}
    }
}
