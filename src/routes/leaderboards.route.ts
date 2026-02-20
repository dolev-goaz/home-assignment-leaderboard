import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { logger as baseLogger } from "@/services/logging";
import { ApiError } from "@/errors/ApiError.error";
import StatusCodes from "http-status-codes";
import { CreateUserSchema, UserIdSchema, UserScoreSchema } from "@/schemas/user.schema";

const tags = ["Leaderboards"];

const MAX_TOP_USER_FETCH = 500;
const topUserFetchParamSchema = Type.Integer({
    minimum: 1,
    maximum: MAX_TOP_USER_FETCH,
});
const userIdParamSchema = Type.Object({
    userId: UserIdSchema,
});
const schemas = {
    addUser: {
        tags,
        description: "Add a new user with a score",
        body: CreateUserSchema,
    },
    updateUserScore: {
        tags,
        description: "Update a user's score",
        params: userIdParamSchema,
        body: UserScoreSchema,
    },
    getTopUsers: {
        tags,
        description: "Retrieve the top N users on the leaderboard",
        querystring: Type.Object({
            limit: Type.Optional(topUserFetchParamSchema),
        }),
    },
    getUserPosition: {
        tags,
        description: "Get a user's current position on the leaderboard",
        params: userIdParamSchema,
    },
} satisfies Record<string, FastifySchema>;

const route: FastifyPluginAsyncTypebox = async (app) => {
    const logger = baseLogger.child({ route: "leaderboards" });
    app.post("/user", { schema: schemas.addUser }, async (req, reply) => {
        logger.info("Add user endpoint called");
        throw new ApiError(StatusCodes.NOT_IMPLEMENTED, "Not implemented");
    });
    app.put("/user/:userId/score", { schema: schemas.updateUserScore }, async (req, reply) => {
        logger.info("Update user score endpoint called");
        throw new ApiError(StatusCodes.NOT_IMPLEMENTED, "Not implemented");
    });
    app.get("/top-users", { schema: schemas.getTopUsers }, async (req, reply) => {
        logger.info("Get top users endpoint called");
        throw new ApiError(StatusCodes.NOT_IMPLEMENTED, "Not implemented");
    });
    app.get("/user/:userId/position", { schema: schemas.getUserPosition }, async (req, reply) => {
        logger.info("Get user position endpoint called");
        throw new ApiError(StatusCodes.NOT_IMPLEMENTED, "Not implemented");
    });
};

export default route;
