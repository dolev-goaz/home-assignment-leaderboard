export type UserID = string;
export interface User {
    id: UserID;
    name: string;
    score: number;
}
export interface PositionedUser extends User {
    rank: number;
    above: User[];
    below: User[];
}
