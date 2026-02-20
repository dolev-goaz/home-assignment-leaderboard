import { CreateUser, UpdateUser } from "@/dal/user";
import type { User, PositionedUser, UserID } from "@/types/user";

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

export const leaderboardManager = new LeaderboardManager();
