import { LeaderboardStore } from "./leaderboard-store";
import { User as UserEntity } from "@/services/database/entities/User.entity";

describe("LeaderboardStore", () => {
    let store: LeaderboardStore;

    beforeEach(() => {
        store = new LeaderboardStore();
    });

    describe("addUser", () => {
        it("should add a user and return user object", () => {
            const result = store.addUser("user1", "Alice", 100);

            expect(result).toEqual({
                id: "user1",
                name: "Alice",
                score: 100,
            });
            expect(store.has("user1")).toBe(true);
            expect(store.size()).toBe(1);
        });

        it("should add multiple users in correct order", () => {
            store.addUser("user1", "Alice", 100);
            store.addUser("user2", "Bob", 200);
            store.addUser("user3", "Charlie", 50);

            const topUsers = store.getTopUsers(10);
            expect(topUsers).toEqual([
                { id: "user2", name: "Bob", score: 200 },
                { id: "user1", name: "Alice", score: 100 },
                { id: "user3", name: "Charlie", score: 50 },
            ]);
        });
    });

    describe("updateUserScore", () => {
        it("should return null for non-existent user", () => {
            const result = store.updateUserScore("nonexistent", 200);
            expect(result).toBeNull();
        });

        it("should update score and maintain position", () => {
            store.addUser("user1", "Alice", 100);
            store.addUser("user2", "Bob", 200);

            const result = store.updateUserScore("user1", 300);

            expect(result).toEqual({
                id: "user1",
                name: "Alice",
                score: 300,
            });

            const topUsers = store.getTopUsers(10);
            expect(topUsers[0]).toEqual({ id: "user1", name: "Alice", score: 300 });
        });

        it("should preserve user name after score update", () => {
            store.addUser("user1", "Alice", 100);

            store.updateUserScore("user1", 200);

            const position = store.getUserPosition("user1");
            expect(position?.name).toBe("Alice");
        });

        it("should handle multiple score updates", () => {
            store.addUser("user1", "Alice", 100);

            store.updateUserScore("user1", 50);
            store.updateUserScore("user1", 300);
            store.updateUserScore("user1", 150);

            const position = store.getUserPosition("user1");
            expect(position?.score).toBe(150);
        });
    });

    describe("getTopUsers", () => {
        it("should return empty array for empty store", () => {
            expect(store.getTopUsers(10)).toEqual([]);
        });

        it("should return top N users", () => {
            for (let i = 0; i < 20; i++) {
                store.addUser(`user${i}`, `User${i}`, i * 10);
            }

            const topUsers = store.getTopUsers(5);
            expect(topUsers).toHaveLength(5);
            expect(topUsers[0].score).toBe(190);
            expect(topUsers[4].score).toBe(150);
        });

        it("should return all users if N > size", () => {
            store.addUser("user1", "Alice", 100);
            store.addUser("user2", "Bob", 50);

            const topUsers = store.getTopUsers(100);
            expect(topUsers).toHaveLength(2);
        });
    });

    describe("getUserPosition", () => {
        it("should return null for non-existent user", () => {
            expect(store.getUserPosition("nonexistent")).toBeNull();
        });

        it("should return correct position for user in middle", () => {
            store.addUser("user1", "Alice", 500);
            store.addUser("user2", "Bob", 400);
            store.addUser("user3", "Charlie", 300);
            store.addUser("user4", "Diana", 200);
            store.addUser("user5", "Eve", 100);

            const position = store.getUserPosition("user3");

            expect(position?.rank).toBe(3);
            expect(position?.name).toBe("Charlie");
            expect(position?.score).toBe(300);
            expect(position?.above).toHaveLength(2);
            expect(position?.below).toHaveLength(2);
        });

        it("should return correct position for top user", () => {
            store.addUser("user1", "Alice", 300);
            store.addUser("user2", "Bob", 200);
            store.addUser("user3", "Charlie", 100);

            const position = store.getUserPosition("user1");

            expect(position?.rank).toBe(1);
            expect(position?.above).toHaveLength(0);
            expect(position?.below).toHaveLength(2);
        });

        it("should return correct position for bottom user", () => {
            store.addUser("user1", "Alice", 300);
            store.addUser("user2", "Bob", 200);
            store.addUser("user3", "Charlie", 100);

            const position = store.getUserPosition("user3");

            expect(position?.rank).toBe(3);
            expect(position?.above).toHaveLength(2);
            expect(position?.below).toHaveLength(0);
        });

        it("should return up to 5 users above and below", () => {
            for (let i = 0; i < 11; i++) {
                store.addUser(`user${i}`, `User${i}`, (10 - i) * 100);
            }

            const position = store.getUserPosition("user5");

            expect(position?.above).toHaveLength(5);
            expect(position?.below).toHaveLength(5);
        });

        it("should have correct users in above and below arrays", () => {
            store.addUser("user1", "Alice", 500);
            store.addUser("user2", "Bob", 400);
            store.addUser("user3", "Charlie", 300);
            store.addUser("user4", "Diana", 200);
            store.addUser("user5", "Eve", 100);

            const position = store.getUserPosition("user3");

            expect(position?.above).toEqual([
                { id: "user1", name: "Alice", score: 500 },
                { id: "user2", name: "Bob", score: 400 },
            ]);
            expect(position?.below).toEqual([
                { id: "user4", name: "Diana", score: 200 },
                { id: "user5", name: "Eve", score: 100 },
            ]);
        });
    });

    describe("loadUsers", () => {
        it("should load multiple users from database format", () => {
            const users = [
                { userId: "user1", name: "Alice", score: 100 },
                { userId: "user2", name: "Bob", score: 200 },
                { userId: "user3", name: "Charlie", score: 50 },
            ] as UserEntity[];

            store.loadUsers(users);

            expect(store.size()).toBe(3);
            const topUsers = store.getTopUsers(3);
            expect(topUsers).toEqual([
                { id: "user2", name: "Bob", score: 200 },
                { id: "user1", name: "Alice", score: 100 },
                { id: "user3", name: "Charlie", score: 50 },
            ]);
        });

        it("should handle empty array", () => {
            store.loadUsers([]);
            expect(store.size()).toBe(0);
        });

        it("should handle large batch load", () => {
            const users = Array.from({ length: 1000 }, (_, i) => ({
                userId: `user${i}`,
                name: `User${i}`,
                score: Math.floor(Math.random() * 10000),
            })) as UserEntity[];

            store.loadUsers(users);

            expect(store.size()).toBe(1000);
        });
    });

    describe("has", () => {
        it("should return true for existing user", () => {
            store.addUser("user1", "Alice", 100);
            expect(store.has("user1")).toBe(true);
        });

        it("should return false for non-existent user", () => {
            expect(store.has("nonexistent")).toBe(false);
        });
    });

    describe("size", () => {
        it("should return correct count after operations", () => {
            expect(store.size()).toBe(0);

            store.addUser("user1", "Alice", 100);
            expect(store.size()).toBe(1);

            store.addUser("user2", "Bob", 200);
            expect(store.size()).toBe(2);
        });
    });

    describe("edge cases", () => {
        it("should handle users with same score", () => {
            store.addUser("user1", "Alice", 100);
            store.addUser("user2", "Bob", 100);
            store.addUser("user3", "Charlie", 100);

            const topUsers = store.getTopUsers(3);
            expect(topUsers.map((u) => u.id).sort()).toEqual(["user1", "user2", "user3"]);
        });

        it("should handle score of 0", () => {
            store.addUser("user1", "Alice", 0);

            const position = store.getUserPosition("user1");
            expect(position?.score).toBe(0);
        });

        it("should handle negative scores", () => {
            store.addUser("user1", "Alice", -100);
            store.addUser("user2", "Bob", 100);

            const topUsers = store.getTopUsers(2);
            expect(topUsers[0]).toEqual({ id: "user2", name: "Bob", score: 100 });
            expect(topUsers[1]).toEqual({ id: "user1", name: "Alice", score: -100 });
        });

        it("should handle very large scores", () => {
            const largeScore = Number.MAX_SAFE_INTEGER;
            store.addUser("user1", "Alice", largeScore);

            const position = store.getUserPosition("user1");
            expect(position?.score).toBe(largeScore);
        });
    });
});
