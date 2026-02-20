import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { logger as baseLogger } from "@/services/logging";
import { ApiError } from "@/errors/ApiError.error";
import StatusCodes from "http-status-codes";
import {
    CreateUserSchema,
    UserIdSchema,
    UserScoreSchema,
    UserSchema,
    PositionedUserSchema,
} from "@/schemas/user.schema";
import {
    initializeLeaderboardManager,
    getLeaderboardManager,
} from "@/route-services/leaderboards.service";

const tags = ["Leaderboards"];

const MAX_TOP_USER_FETCH = 500;
const topUserFetchParamSchema = Type.Integer({
    minimum: 1,
    maximum: MAX_TOP_USER_FETCH,
});
const userIdParamSchema = Type.Object({
    userId: UserIdSchema,
});

const userScoreBodySchema = Type.Object({
    score: UserScoreSchema,
});
const schemas = {
    addUser: {
        tags,
        description: "Add a new user with a score",
        body: CreateUserSchema,
        response: {
            [StatusCodes.CREATED]: UserSchema,
        },
    },
    updateUserScore: {
        tags,
        description: "Update a user's score",
        params: userIdParamSchema,
        body: userScoreBodySchema,
        response: {
            [StatusCodes.OK]: UserSchema,
        },
    },
    getTopUsers: {
        tags,
        description: "Retrieve the top N users on the leaderboard",
        querystring: Type.Object({
            limit: Type.Optional(topUserFetchParamSchema),
        }),
        response: {
            [StatusCodes.OK]: Type.Array(UserSchema),
        },
    },
    getUserPosition: {
        tags,
        description: "Get a user's current position on the leaderboard",
        params: userIdParamSchema,
        response: {
            [StatusCodes.OK]: PositionedUserSchema,
        },
    },
} satisfies Record<string, FastifySchema>;

// TODO: should convert output to DTOs
const route: FastifyPluginAsyncTypebox = async (app) => {
    const logger = baseLogger.child({ route: "leaderboards" });
    initializeLeaderboardManager();
    app.post("/user", { schema: schemas.addUser }, async (req, reply) => {
        logger.info("Add user endpoint called");
        const { name, score } = req.body;
        const user = await getLeaderboardManager().addUser(name, score);
        reply.status(StatusCodes.CREATED).send(user);
    });
    app.put("/user/:userId/score", { schema: schemas.updateUserScore }, async (req, reply) => {
        logger.info("Update user score endpoint called");
        const { userId } = req.params;
        const { score } = req.body;
        const user = await getLeaderboardManager().updateUserScore(userId, score);
        return user;
    });
    app.get("/top-users", { schema: schemas.getTopUsers }, async (req, reply) => {
        logger.info("Get top users endpoint called");
        const { limit = 10 } = req.query;
        const topUsers = getLeaderboardManager().getTopUsers(limit);
        return topUsers;
    });
    app.get("/user/:userId/position", { schema: schemas.getUserPosition }, async (req, reply) => {
        logger.info("Get user position endpoint called");
        const { userId } = req.params;
        const userPosition = getLeaderboardManager().getUserPosition(userId);
        if (!userPosition) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        return userPosition;
    });
};

export default route;
