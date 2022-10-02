import mysql, { Connection } from "mysql2/promise";
import { MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USERNAME } from "./env";

export const mysqlSettings: mysql.ConnectionOptions = {
  host: "localhost",
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
};

export async function withTransaction(
  db: Connection,
  callback: () => Promise<void>
) {
  await db.beginTransaction();
  try {
    await callback();
    await db.commit();
  } catch (e) {
    await db.rollback();
    throw e;
  }
}
