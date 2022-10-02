import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";
import { withTransaction } from "../lib/db";
import { invalidToken } from "../lib/errors";
import { REFRESH_TOKEN_EXPIRATION } from "../lib/tokens";

export interface RefreshTokenRow extends RowDataPacket {
  id: number;
  token: string;
  owner_id: number;
  created_at: string;
}

export class RefreshTokenModel {
  conn: Connection;
  constructor(conn: Connection) {
    this.conn = conn;
  }
  async insert(refresh_token: string, owner_id: number): Promise<number> {
    const [result] = await this.conn.execute<ResultSetHeader>(
      "INSERT INTO `refresh_token` (token, owner_id, expiry) VALUE (?, ?, NOW() + INTERVAL ? SECOND)",
      [refresh_token, owner_id, REFRESH_TOKEN_EXPIRATION / 1000]
    );
    return result.insertId;
  }

  async checkAndRemove(refresh_token: string, owner_id: number): Promise<void> {
    await withTransaction(this.conn, async () => {
      const [{ affectedRows }] = await this.conn.execute<ResultSetHeader>(
        "DELETE FROM `refresh_token` WHERE token = ? AND owner_id = ? AND expiry >= NOW()",
        [refresh_token, owner_id]
      );
      if (affectedRows !== 0) throw invalidToken();
    });
  }

  async remove(refresh_token: string): Promise<void> {
    await withTransaction(this.conn, async () => {
      const [{ affectedRows }] = await this.conn.execute<ResultSetHeader>(
        "DELETE FROM `refresh_token` WHERE token = ? AND expiry >= NOW()",
        [refresh_token]
      );
      if (affectedRows !== 0) throw invalidToken();
    });
  }

  async purge(): Promise<void> {
    await this.conn.query("DELETE FROM `refresh_token` WHERE expiry < NOW()");
  }
}
