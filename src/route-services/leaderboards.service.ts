import { CreateUser, UpdateUser } from "@/dal/user";
import type { User, PositionedUser, UserID } from "@/types/user";
import { logger } from "@/services/logging";
import { LeaderboardStore } from "./leaderboards/data-structures";

interface ILeaderboardManager {
    addUser(userId: UserID, score: number): Promise<User>;
    updateUserScore(userId: UserID, newScore: number): Promise<User>;
    getTopUsers(n: number): User[];
    getUserPosition(userId: UserID): PositionedUser | null;
    loadUsers(users: User[]): void;
}

class LeaderboardManager implements ILeaderboardManager {
    private store: LeaderboardStore;
    private logger = logger.child({ service: "leaderboard" });

    constructor() {
        this.store = new LeaderboardStore();
    }

    async addUser(userName: string, score: number) {
        this.logger.child({ userName, score }).info("Attempting to add new user to leaderboard");
        const user = await CreateUser.createUser({
            name: userName,
            score,
        });
        this.store.addUser(user.userId, user.name, user.score);
        this.logger.child({ userId: user.userId, score }).info("Added new user to leaderboard");
        return {
            id: user.userId,
            name: user.name,
            score: user.score,
        };
    }

    async updateUserScore(userId: UserID, newScore: number) {
        this.logger
            .child({ userId, newScore })
            .info("Attempting to update user score in leaderboard");
        const user = await UpdateUser.updateUserScore({
            id: userId,
            score: newScore,
        });
        this.store.updateUserScore(userId, newScore);
        this.logger.child({ userId, newScore }).info("Updated user score in leaderboard");
        return {
            id: user.userId,
            name: user.name,
            score: user.score,
        };
    }

    getTopUsers(n: number): User[] {
        return this.store.getTopUsers(n);
    }

    getUserPosition(userId: UserID): PositionedUser | null {
        return this.store.getUserPosition(userId);
    }

    loadUsers(users: User[]): void {
        this.store.loadUsers(users);
    }
}

let leaderboardManager: ILeaderboardManager;

export function initializeLeaderboardManager() {
    logger.child({ service: "leaderboard" }).info("Initializing leaderboard manager");
    leaderboardManager = new LeaderboardManager();
}

export function getLeaderboardManager() {
    if (!leaderboardManager) {
        throw new Error("Leaderboard manager not initialized");
    }
    return leaderboardManager;
}
