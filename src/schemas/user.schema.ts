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

export const CreateUserSchema = Type.Object(
    {
        name: UserNameSchema,
        score: UserScoreSchema,
    },
    { description: "Schema for creating a new user with a name and score" },
);
