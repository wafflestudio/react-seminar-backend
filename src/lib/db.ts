import mysql, { Connection } from "mysql2/promise";
import { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE } from "./env";
let connection: Connection | null = null;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: "localhost",
      user: MYSQL_USERNAME,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
    });
  }
  return connection;
}

export const execute = async <
  T extends mysql.RowDataPacket[] | mysql.ResultSetHeader
>(
  sql: string,
  values: (string | number | null)[]
): Promise<T> => {
  const conn = await getConnection();
  const [results] = await conn.execute<T>(sql, values);
  return results;
};

export default getConnection;
