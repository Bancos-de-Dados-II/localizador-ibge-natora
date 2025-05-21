import { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres"
  },
};

export default config;
