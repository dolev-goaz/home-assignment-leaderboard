import { SkipList } from "./skip-list";

interface TestEntry {
    id: string;
    score: number;
}

function createEntry(id: string, score: number): TestEntry {
    return { id, score };
}

describe("SkipList", () => {
    let skipList: SkipList<TestEntry>;

    beforeEach(() => {
        skipList = new SkipList<TestEntry>();
    });

    describe("insert", () => {
        it("should insert a single element", () => {
            skipList.insert(createEntry("user1", 100));
            expect(skipList.getLength()).toBe(1);
            expect(skipList.has("user1")).toBe(true);
        });

        it("should insert multiple elements in sorted order (descending by score)", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 50));

            const top = skipList.getFirstN(3);
            expect(top).toEqual([
                { id: "user2", score: 200 },
                { id: "user1", score: 100 },
                { id: "user3", score: 50 },
            ]);
        });

        it("should sort by userId ascending when scores are equal", () => {
            skipList.insert(createEntry("charlie", 100));
            skipList.insert(createEntry("alice", 100));
            skipList.insert(createEntry("bob", 100));

            const top = skipList.getFirstN(3);
            expect(top).toEqual([
                { id: "alice", score: 100 },
                { id: "bob", score: 100 },
                { id: "charlie", score: 100 },
            ]);
        });

        it("should not insert duplicate ids", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.insert(createEntry("user1", 200));

            expect(skipList.getLength()).toBe(1);
            const top = skipList.getFirstN(1);
            expect(top[0].score).toBe(100);
        });

        it("should handle many insertions", () => {
            const count = 1000;
            for (let i = 0; i < count; i++) {
                skipList.insert(createEntry(`user${i}`, Math.random() * 10000));
            }
            expect(skipList.getLength()).toBe(count);
        });
    });

    describe("remove", () => {
        it("should remove an existing element", () => {
            skipList.insert(createEntry("user1", 100));
            const result = skipList.remove("user1");
            expect(result).toBe(true);
            expect(skipList.getLength()).toBe(0);
            expect(skipList.has("user1")).toBe(false);
        });

        it("should return false when removing non-existent element", () => {
            const result = skipList.remove("nonexistent");
            expect(result).toBe(false);
        });

        it("should maintain correct order after removal", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 50));

            skipList.remove("user2");

            const top = skipList.getFirstN(2);
            expect(top).toEqual([
                { id: "user1", score: 100 },
                { id: "user3", score: 50 },
            ]);
        });

        it("should handle removal of head element", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.insert(createEntry("user2", 50));

            skipList.remove("user1");

            expect(skipList.getLength()).toBe(1);
            const top = skipList.getFirstN(1);
            expect(top[0]).toEqual({ id: "user2", score: 50 });
        });

        it("should handle removal of tail element", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.insert(createEntry("user2", 50));

            skipList.remove("user2");

            expect(skipList.getLength()).toBe(1);
            const top = skipList.getFirstN(1);
            expect(top[0]).toEqual({ id: "user1", score: 100 });
        });
    });

    describe("getRank", () => {
        it("should return -1 for non-existent user", () => {
            expect(skipList.getRank("nonexistent")).toBe(-1);
        });

        it("should return correct rank for single element", () => {
            skipList.insert(createEntry("user1", 100));
            expect(skipList.getRank("user1")).toBe(1);
        });

        it("should return correct ranks for multiple elements", () => {
            skipList.insert(createEntry("user1", 300));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 100));

            expect(skipList.getRank("user1")).toBe(1);
            expect(skipList.getRank("user2")).toBe(2);
            expect(skipList.getRank("user3")).toBe(3);
        });

        it("should handle ties correctly", () => {
            skipList.insert(createEntry("alice", 100));
            skipList.insert(createEntry("bob", 100));
            skipList.insert(createEntry("charlie", 100));

            expect(skipList.getRank("alice")).toBe(1);
            expect(skipList.getRank("bob")).toBe(2);
            expect(skipList.getRank("charlie")).toBe(3);
        });

        it("should maintain correct rank after removal", () => {
            skipList.insert(createEntry("user1", 300));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 100));

            skipList.remove("user2");

            expect(skipList.getRank("user1")).toBe(1);
            expect(skipList.getRank("user3")).toBe(2);
        });

        it("should compute rank correctly for many elements", () => {
            const count = 1000;
            const entries: TestEntry[] = [];
            for (let i = 0; i < count; i++) {
                const entry = createEntry(`user${i}`, i);
                entries.push(entry);
                skipList.insert(entry);
            }

            for (let i = 0; i < count; i++) {
                const expectedRank = count - i;
                expect(skipList.getRank(`user${i}`)).toBe(expectedRank);
            }
        });
    });

    describe("getByRank", () => {
        it("should return null for invalid rank", () => {
            skipList.insert(createEntry("user1", 100));
            expect(skipList.getByRank(0)).toBeNull();
            expect(skipList.getByRank(-1)).toBeNull();
            expect(skipList.getByRank(2)).toBeNull();
        });

        it("should return correct element for valid rank", () => {
            skipList.insert(createEntry("user1", 300));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 100));

            expect(skipList.getByRank(1)).toEqual({ id: "user1", score: 300 });
            expect(skipList.getByRank(2)).toEqual({ id: "user2", score: 200 });
            expect(skipList.getByRank(3)).toEqual({ id: "user3", score: 100 });
        });
    });

    describe("getFirstN", () => {
        it("should return empty array for empty list", () => {
            expect(skipList.getFirstN(10)).toEqual([]);
        });

        it("should return all elements if n > length", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.insert(createEntry("user2", 50));

            const result = skipList.getFirstN(10);
            expect(result).toHaveLength(2);
        });

        it("should return first n elements in order", () => {
            for (let i = 0; i < 10; i++) {
                skipList.insert(createEntry(`user${i}`, i * 10));
            }

            const result = skipList.getFirstN(3);
            expect(result).toEqual([
                { id: "user9", score: 90 },
                { id: "user8", score: 80 },
                { id: "user7", score: 70 },
            ]);
        });
    });

    describe("getNeighbors", () => {
        it("should return null for non-existent user", () => {
            expect(skipList.getNeighbors("nonexistent", 2, 2)).toBeNull();
        });

        it("should return empty arrays for single element", () => {
            skipList.insert(createEntry("user1", 100));

            const result = skipList.getNeighbors("user1", 5, 5);
            expect(result).toEqual({
                node: { id: "user1", score: 100 },
                aboveNodes: [],
                belowNodes: [],
            });
        });

        it("should return correct neighbors", () => {
            skipList.insert(createEntry("user1", 500));
            skipList.insert(createEntry("user2", 400));
            skipList.insert(createEntry("user3", 300));
            skipList.insert(createEntry("user4", 200));
            skipList.insert(createEntry("user5", 100));

            const result = skipList.getNeighbors("user3", 2, 2);
            expect(result?.node).toEqual({ id: "user3", score: 300 });
            expect(result?.aboveNodes).toEqual([
                { id: "user1", score: 500 },
                { id: "user2", score: 400 },
            ]);
            expect(result?.belowNodes).toEqual([
                { id: "user4", score: 200 },
                { id: "user5", score: 100 },
            ]);
        });

        it("should handle user at top of leaderboard", () => {
            skipList.insert(createEntry("user1", 300));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 100));

            const result = skipList.getNeighbors("user1", 2, 2);
            expect(result?.aboveNodes).toEqual([]);
            expect(result?.belowNodes).toEqual([
                { id: "user2", score: 200 },
                { id: "user3", score: 100 },
            ]);
        });

        it("should handle user at bottom of leaderboard", () => {
            skipList.insert(createEntry("user1", 300));
            skipList.insert(createEntry("user2", 200));
            skipList.insert(createEntry("user3", 100));

            const result = skipList.getNeighbors("user3", 2, 2);
            expect(result?.aboveNodes).toEqual([
                { id: "user1", score: 300 },
                { id: "user2", score: 200 },
            ]);
            expect(result?.belowNodes).toEqual([]);
        });

        it("should limit neighbors to available count", () => {
            skipList.insert(createEntry("user1", 200));
            skipList.insert(createEntry("user2", 100));

            const result = skipList.getNeighbors("user2", 5, 5);
            expect(result?.aboveNodes).toEqual([{ id: "user1", score: 200 }]);
            expect(result?.belowNodes).toEqual([]);
        });
    });

    describe("integration scenarios", () => {
        it("should handle insert -> remove -> insert cycle", () => {
            skipList.insert(createEntry("user1", 100));
            skipList.remove("user1");
            skipList.insert(createEntry("user1", 200));

            expect(skipList.getLength()).toBe(1);
            expect(skipList.getRank("user1")).toBe(1);
        });

        it("should maintain consistency after many operations", () => {
            for (let i = 0; i < 100; i++) {
                skipList.insert(createEntry(`user${i}`, i));
            }

            for (let i = 0; i < 50; i++) {
                skipList.remove(`user${i}`);
            }

            expect(skipList.getLength()).toBe(50);

            const top = skipList.getFirstN(10);
            let prevScore = Infinity;
            for (const entry of top) {
                expect(entry.score).toBeLessThanOrEqual(prevScore);
                prevScore = entry.score;
            }
        });
    });
});
