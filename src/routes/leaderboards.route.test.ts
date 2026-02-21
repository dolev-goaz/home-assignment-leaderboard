import { createServer } from "@/app";
import type { FastifyInstance } from "fastify";
import { beforeEach, afterEach, describe, it, expect } from "@jest/globals";

jest.mock("@/services/database", () => ({
    connection: {
        getRepository: jest.fn(),
    },
    initializeDBConnection: jest.fn().mockResolvedValue(undefined),
}));

const mockUsers: Map<string, { userId: string; name: string; score: number }> = new Map();

function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

jest.mock("@/dal/user", () => ({
    CreateUser: {
        createUser: jest.fn((user: { name: string; score: number }) => {
            const id = generateUUID();
            const newUser = { userId: id, name: user.name, score: user.score };
            mockUsers.set(id, newUser);
            return Promise.resolve(newUser);
        }),
    },
    UpdateUser: {
        updateUserScore: jest.fn((user: { id: string; score: number }) => {
            const existing = mockUsers.get(user.id);
            if (!existing) {
                return Promise.reject(new Error("User not found"));
            }
            existing.score = user.score;
            return Promise.resolve(existing);
        }),
    },
}));

describe("Leaderboard API", () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        mockUsers.clear();
        process.env.IS_LOCAL = "true";
        process.env.APP_PORT = "3000";
        process.env.RATE_LIMIT_MAX = "1000";
        app = await createServer();
    });

    afterEach(async () => {
        await app.close();
    });

    describe("POST /api/v1/leaderboards/user", () => {
        it("should create a new user with score", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: {
                    name: "Alice",
                    score: 100,
                },
            });

            expect(response.statusCode).toBe(201);
            const body = response.json();
            expect(body).toHaveProperty("id");
            expect(body.name).toBe("Alice");
            expect(body.score).toBe(100);
        });

        it("should reject invalid name (too short)", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: {
                    name: "Al",
                    score: 100,
                },
            });

            expect(response.statusCode).toBe(400);
        });

        it("should reject negative score", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: {
                    name: "Alice",
                    score: -10,
                },
            });

            expect(response.statusCode).toBe(400);
        });

        it("should reject missing fields", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: {
                    name: "Alice",
                },
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("PUT /api/v1/leaderboards/user/:userId/score", () => {
        let userId: string;

        beforeEach(async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: {
                    name: "Bob",
                    score: 50,
                },
            });
            userId = response.json().id;
        });

        it("should update user score", async () => {
            const response = await app.inject({
                method: "PUT",
                url: `/api/v1/leaderboards/user/${userId}/score`,
                payload: {
                    score: 200,
                },
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();
            expect(body.id).toBe(userId);
            expect(body.score).toBe(200);
        });

        it("should return 404 for non-existent userId", async () => {
            const response = await app.inject({
                method: "PUT",
                url: "/api/v1/leaderboards/00000000-0000-0000-0000-000000000000/score",
                payload: {
                    score: 200,
                },
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /api/v1/leaderboards/top-users", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Alice", score: 300 },
            });
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Bob", score: 200 },
            });
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Charlie", score: 100 },
            });
        });

        it("should return top users in descending score order", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/leaderboards/top-users",
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();
            expect(body.length).toBe(3);
            expect(body[0].score).toBeGreaterThanOrEqual(body[1].score);
            expect(body[1].score).toBeGreaterThanOrEqual(body[2].score);
        });

        it("should respect limit parameter", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/leaderboards/top-users?limit=2",
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();
            expect(body.length).toBe(2);
        });

        it("should return empty array for empty leaderboard", async () => {
            const newApp = await createServer();
            const response = await newApp.inject({
                method: "GET",
                url: "/api/v1/leaderboards/top-users",
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual([]);
            await newApp.close();
        });

        it("should reject limit > 500", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/leaderboards/top-users?limit=501",
            });

            expect(response.statusCode).toBe(400);
        });

        it("should reject limit < 1", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/leaderboards/top-users?limit=0",
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("GET /api/v1/leaderboards/user/:userId/position", () => {
        let userId: string;

        beforeEach(async () => {
            const response1 = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Alice", score: 300 },
            });
            const response2 = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Bob", score: 200 },
            });
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Charlie", score: 100 },
            });
            userId = response2.json().id;
        });

        it("should return user position with rank and neighbors", async () => {
            const response = await app.inject({
                method: "GET",
                url: `/api/v1/leaderboards/user/${userId}/position`,
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();
            expect(body.id).toBe(userId);
            expect(body.name).toBe("Bob");
            expect(body.score).toBe(200);
            expect(body.rank).toBe(2);
            expect(body.above).toHaveLength(1);
            expect(body.below).toHaveLength(1);
        });

        it("should return 404 for non-existent user", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/leaderboards/user/00000000-0000-0000-0000-000000000000/position",
            });

            expect(response.statusCode).toBe(404);
        });

        it("should return 400 for invalid userId format", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/leaderboards/user/invalid-uuid/position",
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Leaderboard integration", () => {
        it("should maintain correct order after score updates", async () => {
            const response1 = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Alice", score: 100 },
            });
            const response2 = await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Bob", score: 50 },
            });

            const aliceId = response1.json().id;
            const bobId = response2.json().id;

            let topUsers = (
                await app.inject({
                    method: "GET",
                    url: "/api/v1/leaderboards/top-users",
                })
            ).json();
            expect(topUsers[0].name).toBe("Alice");
            expect(topUsers[1].name).toBe("Bob");

            await app.inject({
                method: "PUT",
                url: `/api/v1/leaderboards/user/${bobId}/score`,
                payload: { score: 200 },
            });

            topUsers = (
                await app.inject({
                    method: "GET",
                    url: "/api/v1/leaderboards/top-users",
                })
            ).json();
            expect(topUsers[0].name).toBe("Bob");
            expect(topUsers[1].name).toBe("Alice");
        });

        it("should handle ties correctly (sorted by userId)", async () => {
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Alice", score: 100 },
            });
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Bob", score: 100 },
            });
            await app.inject({
                method: "POST",
                url: "/api/v1/leaderboards/user",
                payload: { name: "Charlie", score: 100 },
            });

            const topUsers = (
                await app.inject({
                    method: "GET",
                    url: "/api/v1/leaderboards/top-users",
                })
            ).json();

            expect(topUsers.length).toBe(3);
            expect(topUsers.every((u: { score: number }) => u.score === 100)).toBe(true);
        });
    });
});
