import { connection } from "@/services/database";
import type { User } from "@/types/user";
import { User as UserEntity } from "@/services/database/entities/User.entity";

type CreateUserOptions = Omit<User, "id">;
export function createUser(user: CreateUserOptions) {
    const repository = connection.getRepository(UserEntity);

    const dalUser = repository.create({
        name: user.name,
        score: user.score,
    });

    return repository.save(dalUser);
}
