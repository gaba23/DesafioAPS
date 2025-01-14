import { DataSource } from "typeorm";
import { Client } from "../entities/client";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "db.rkxlyqytvfolfnejrtkg.supabase.co",
  port: 5432,
  username: "postgres",
  password: "desafioaps23",
  database: "postgres",
  synchronize: true,
  logging: false,
  entities: [Client],
  migrations: [],
  subscribers: [],
});
