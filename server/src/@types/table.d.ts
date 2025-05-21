import { Municipio } from "../models/Municipio";
import { Estado } from "../models/Estado";
import { Knex } from "knex";

declare module "knex/types/tables" {
  interface Tables {
    municipios: Municipio;
    estados: Estado;
  }
}
