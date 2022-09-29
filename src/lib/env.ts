import dotenv from "dotenv";

dotenv.config();

const _MYSQL_USERNAME = process.env.MYSQL_USERNAME;
const _MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const _MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const _JWT_SECRET = process.env.JWT_SECRET;

if (!(_MYSQL_USERNAME && _MYSQL_PASSWORD && _MYSQL_DATABASE && _JWT_SECRET))
  process.exit(1);

export const MYSQL_USERNAME = _MYSQL_USERNAME;
export const MYSQL_PASSWORD = _MYSQL_PASSWORD;
export const MYSQL_DATABASE = _MYSQL_DATABASE;
export const JWT_SECRET = _JWT_SECRET;
