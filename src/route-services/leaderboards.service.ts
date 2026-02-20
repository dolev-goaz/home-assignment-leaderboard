import { CreateUser, UpdateUser } from "@/dal/user";
import type { User, PositionedUser, UserID } from "@/types/user";
import { logger } from "@/services/logging";

interface ILeaderboardManager {
    addUser(userId: UserID, score: number): Promise<void>;
    updateUserScore(userId: UserID, newScore: number): Promise<void>;
    getTopUsers(n: number): User[];
    getUserPosition(userId: UserID): PositionedUser | null;
}
class LeaderboardManager implements ILeaderboardManager {
    async addUser(userName: string, score: number) {
        await CreateUser.createUser({
            name: userName,
            score,
        });
        // TODO: store in internal data structure
    }
    async updateUserScore(userId: UserID, newScore: number) {
        await UpdateUser.updateUserScore({
            id: userId,
            score: newScore,
        });
        // TODO: update internal data structure
    }
    getTopUsers(n: number): User[] {
        throw new Error("Method not implemented.");
    }
    getUserPosition(userId: UserID): PositionedUser | null {
        throw new Error("Method not implemented.");
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
