import type { User, PositionedUser, UserID } from "@/types/user";
import { SkipList } from "./skip-list";

interface LeaderboardEntry {
    id: string;
    score: number;
    name: string;
}

export class LeaderboardStore {
    private skipList: SkipList<LeaderboardEntry>;

    constructor() {
        this.skipList = new SkipList<LeaderboardEntry>();
    }

    addUser(id: string, name: string, score: number): User {
        const entry: LeaderboardEntry = { id, score, name };
        this.skipList.insert(entry);
        return { id, name, score };
    }

    updateUserScore(id: string, newScore: number): User | null {
        const existingEntry = this.skipList.getEntry(id);
        if (!existingEntry) {
            return null;
        }
        const name = existingEntry.name;
        this.skipList.remove(id);
        const entry: LeaderboardEntry = { id, score: newScore, name };
        this.skipList.insert(entry);
        return { id, name, score: newScore };
    }

    getTopUsers(n: number): User[] {
        const entries = this.skipList.getFirstN(n);
        return entries;
    }

    getUserPosition(id: UserID): PositionedUser | null {
        const rank = this.skipList.getRank(id);
        if (rank === -1) {
            return null;
        }

        const neighbors = this.skipList.getNeighbors(id, 5, 5);
        if (!neighbors) {
            return null;
        }

        return {
            id,
            name: neighbors.node.name,
            score: neighbors.node.score,
            rank,
            above: neighbors.aboveNodes,
            below: neighbors.belowNodes,
        };
    }

    loadUsers(users: User[]): void {
        for (const user of users) {
            this.addUser(user.id, user.name, user.score);
        }
    }

    has(id: string): boolean {
        return this.skipList.has(id);
    }

    size(): number {
        return this.skipList.getLength();
    }
}
