import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DatabaseOperationsLogger } from "@/services/logging/typeorm-loggers";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const connection = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,

  migrations: [],
  synchronize: true, // in real production code we would use migrations instead
  namingStrategy: new SnakeNamingStrategy(),
  logging: true,
  logger: new DatabaseOperationsLogger(),
});

export async function initializeDBConnection(): Promise<DataSource> {
  if (connection.isInitialized) {
    return connection;
  }
  return connection.initialize();
}
