import { connection } from "@/services/database";
import type { User } from "@/types/user";
import { User as UserEntity } from "@/services/database/entities/User.entity";

type UpdateUserScoreOptions = Omit<User, "name">;
export async function updateUserScore(user: UpdateUserScoreOptions) {
    const repository = connection.getRepository(UserEntity);
    const existingUser = await repository.findOneBy({ userId: user.id });
    if (!existingUser) {
        throw new Error("User not found");
    }
    existingUser.score = user.score;
    return repository.save(existingUser);
}
