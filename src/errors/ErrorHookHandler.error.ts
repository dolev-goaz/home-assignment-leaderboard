import { logger } from "@/services/logging";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

type Fn = () => void;

function extractValidationErrors(request: FastifyRequest, error: FastifyError) {
    return error.validation?.map((v) => {
        const pathParts = v.instancePath.split("/").filter(Boolean);
        pathParts.unshift(error.validationContext!);

        let value: unknown;
        try {
            let current: any = request;
            for (const part of pathParts) {
                current = current[part];
            }
            value = current;
        } catch {
            value = undefined;
        }

        return {
            path: pathParts.join("/"),
            value,
            message: v.message,
            params: v.params,
        };
    });
}

// handles errors that are not caught by the global error handler, like serialization/validation errors
export function errorHookhandler(
    request: FastifyRequest,
    _reply: FastifyReply,
    error: FastifyError,
    done: Fn,
) {
    if (error.validation) {
        const failedFields = extractValidationErrors(request, error);

        logger
            .child({
                operation: "validation_error",
                errorMessage: error.message,
                failedFields,
            })
            .error("Request validation failed");
        // hide validation errors in production(don't reveal what fields are needed)
        if (process.env.NODE_ENV === "prod") {
            error.message = "Bad Request";

            // @ts-ignore
            delete error["code"];
        }
    }
    done();
}
