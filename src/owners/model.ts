import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";
import { RefreshTokenRow } from "../auth/tokenModel";
import { withTransaction } from "../lib/db";
import { raiseOwnerNotFound } from "../lib/errors";
import { selectOne } from "../lib/utils";

interface OwnerData {
  id: number;
  username: string;
  password: string;
  store_name?: string;
  store_description?: string;
  created_at: string;
  updated_at?: string;
}

export type OwnerRow = RowDataPacket & OwnerData;

type OwnerCreateInput = Omit<OwnerData, "created_at" | "updated_at" | "id">;

export class OwnerModel {
  conn: Connection;
  constructor(conn: Connection) {
    this.conn = conn;
  }
  async getById(id: number): Promise<OwnerRow | null> {
    const [results] = await this.conn.execute<OwnerRow[]>(
      "SELECT * FROM `owner` WHERE id = ?",
      [id]
    );
    return selectOne(results);
  }

  async getByRefreshToken(
    token: string
  ): Promise<(OwnerRow & RefreshTokenRow) | null> {
    const [results] = await this.conn.execute<(OwnerRow & RefreshTokenRow)[]>(
      "SELECT * FROM `owner` RIGHT JOIN `refresh_token` RT on `owner`.id = RT.owner_id WHERE token = ? AND expiry >= NOW()",
      [token]
    );
    return selectOne(results);
  }

  async getByUsername(username: string): Promise<OwnerRow | null> {
    const [results] = await this.conn.execute<OwnerRow[]>(
      "SELECT * FROM `owner` WHERE username = ?",
      [username]
    );
    return selectOne(results);
  }

  async updateStoreName(id: number, storeName: string): Promise<void> {
    await withTransaction(this.conn, async () => {
      const [results] = await this.conn.execute<ResultSetHeader>(
        "UPDATE `owner` SET store_name=? WHERE id=?",
        [storeName, id]
      );
      if (results.affectedRows !== 1) raiseOwnerNotFound();
    });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await withTransaction(this.conn, async () => {
      const [result] = await this.conn.execute<ResultSetHeader>(
        "UPDATE `owner` SET password=? WHERE id=?",
        [password, id]
      );
      if (result.affectedRows !== 1) raiseOwnerNotFound();
    });
  }

  async createMany(inputs: OwnerCreateInput[]): Promise<void> {
    const params: (string | null)[] = inputs.flatMap((input) => [
      input.username,
      input.password,
      input.store_name ?? null,
      input.store_description ?? null,
    ]);
    await this.conn.query(
      "INSERT INTO `owner` (username, password, store_name, store_description) VALUES " +
        inputs.map(() => "(?, ?, ?, ?)").join(", "),
      params
    );
  }
}
