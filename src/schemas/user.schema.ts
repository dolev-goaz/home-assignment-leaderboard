import { Type } from "@sinclair/typebox";

export const UserIdSchema = Type.String({
    format: "uuid",
    description: "The unique identifier for a user",
});
export const UserNameSchema = Type.String({
    minLength: 3,
    maxLength: 30,
    description: "The name of the user",
});
export const UserScoreSchema = Type.Integer({
    minimum: 0,
    description: "The total score of the user",
});
export const UserRankSchema = Type.Integer({
    minimum: 1,
    description: "The user's current rank on the leaderboard",
});

export const CreateUserSchema = Type.Object(
    {
        name: UserNameSchema,
        score: UserScoreSchema,
    },
    { description: "Schema for creating a new user with a name and score" },
);

export const UserDTOSchema = Type.Object(
    {
        id: UserIdSchema,
        name: UserNameSchema,
        score: UserScoreSchema,
    },
    { description: "Schema representing a user with an ID, name, and score" },
);

export const PositionedUserSchema = Type.Intersect(
    [
        UserDTOSchema,
        Type.Object({
            rank: UserRankSchema,
            above: Type.Array(UserDTOSchema, {
                description: "List of users ranked above this user",
            }),
            below: Type.Array(UserDTOSchema, {
                description: "List of users ranked below this user",
            }),
        }),
    ],
    {
        description:
            "Schema representing a user along with their position and surrounding users on the leaderboard",
    },
);
