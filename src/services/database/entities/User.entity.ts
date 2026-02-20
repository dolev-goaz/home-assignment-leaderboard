import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

// Define UserRole as a const object for type safety
export const UserRole = {
    USER: "user",
    ADMIN: "admin",
} as const;

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn("text")
    userId: string;

    @Column("int")
    score: number;
}
