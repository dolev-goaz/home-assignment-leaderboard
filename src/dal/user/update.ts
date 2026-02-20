import { connection } from "@/services/database";
import type { User } from "@/types/user";
import { User as UserEntity } from "@/services/database/entities/User.entity";

type UpdateUserScoreOptions = Omit<User, "name">;
export function updateUserScore(user: UpdateUserScoreOptions) {
    const repository = connection.getRepository(UserEntity);
    const queryBuilder = repository.createQueryBuilder("user");

    queryBuilder
        .update(UserEntity)
        .set({ score: user.score })
        .where("userId = :userId", { userId: user.id });

    return queryBuilder.execute();
}
