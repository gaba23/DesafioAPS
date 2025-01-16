import { DataSource } from "typeorm";
import { Client } from "../entities/client";

// Informações sobre o banco de dados necessárias, foi utilizado postgres em conjunto com o Supabase para auxiliar a upar o banco
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
