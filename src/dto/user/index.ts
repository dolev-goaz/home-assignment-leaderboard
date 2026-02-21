import { User as UserEntity } from "@/services/database/entities/User.entity";
import type { User } from "@/types/user";

export function userToDTO(user: UserEntity): User {
    return {
        id: user.userId,
        name: user.name,
        score: user.score,
    };
}

export function DTOToUser(dto: User): UserEntity {
    const user = new UserEntity();
    user.userId = dto.id;
    user.name = dto.name;
    user.score = dto.score;
    return user;
}
