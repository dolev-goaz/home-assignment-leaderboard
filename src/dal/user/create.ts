import { connection } from "@/services/database";
import type { User } from "@/types/user";
import { User as UserEntity } from "@/services/database/entities/User.entity";

type CreateUserOptions = Omit<User, "id"> & Partial<Pick<User, "id">>;
export function createUser(user: CreateUserOptions) {
    const repository = connection.getRepository(UserEntity);
    const queryBuilder = repository.createQueryBuilder("user");

    queryBuilder
        .insert()
        .into(UserEntity)
        .values({
            userId: user.id,
            name: user.name,
            score: user.score,
        })
        .orIgnore();

    return queryBuilder.execute();
}
