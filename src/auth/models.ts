import { ResultSetHeader, RowDataPacket } from "mysql2";
import { execute } from "../lib/db";
import { REFRESH_TOKEN_EXPIRATION } from "../lib/tokens";

export interface RefreshTokenRow extends RowDataPacket {
  id: number;
  refresh_token: string;
  owner_id: number;
  created_at: string;
}

export async function insertRefreshToken(
  refresh_token: string,
  owner_id: number
): Promise<number> {
  const result = await execute<ResultSetHeader>(
    "INSERT INTO RefreshToken (refresh_token, owner_id, expiry) VALUE (?, ?, NOW() + INTERVAL ? SECOND)",
    [refresh_token, owner_id, REFRESH_TOKEN_EXPIRATION / 1000]
  );
  return result.insertId;
}

export async function removeRefreshToken(
  refresh_token: string
): Promise<boolean> {
  const { affectedRows } = await execute<ResultSetHeader>(
    "DELETE FROM RefreshToken WHERE refresh_token = ? AND expiry >= NOW()",
    [refresh_token]
  );
  return affectedRows !== 0;
}

export async function purgeRefreshTokens(): Promise<void> {
  await execute("DELETE FROM RefreshToken WHERE expiry < NOW()", []);
}
