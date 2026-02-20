type UserID = string;
interface User {
    id: UserID;
    name: string;
    score: number;
}
interface PositionedUser extends User {
    rank: number;
    above: User[];
    below: User[];
}
interface ILeaderboardManager {
    addUser(userId: UserID, score: number): Promise<void>;
    updateUserScore(userId: UserID, newScore: number): Promise<void>;
    getTopUsers(n: number): User[];
    getUserPosition(userId: UserID): PositionedUser | null;
}
class LeaderboardManager implements ILeaderboardManager {
    async addUser(userName: string, score: number) {
        throw new Error("Method not implemented.");
    }
    async updateUserScore(userId: UserID, newScore: number) {
        throw new Error("Method not implemented.");
    }
    getTopUsers(n: number): User[] {
        throw new Error("Method not implemented.");
    }
    getUserPosition(userId: UserID): PositionedUser | null {
        throw new Error("Method not implemented.");
    }
}

export const leaderboardManager = new LeaderboardManager();
