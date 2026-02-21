import { connection } from "@/services/database";
import { User } from "@/services/database/entities/User.entity";

export function getAllUsers() {
    const repository = connection.getRepository(User);
    return repository.find();
}
