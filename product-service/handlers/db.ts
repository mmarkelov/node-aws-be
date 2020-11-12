import {PoolConfig} from "pg";

const {PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD} = process.env;

const DB_OPTIONS = {
    host: PG_HOST,
    port: Number(PG_PORT),
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD
} as PoolConfig

export {
    DB_OPTIONS
}
