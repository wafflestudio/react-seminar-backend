import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";
import { RefreshTokenRow } from "../auth/tokenModel";
import { withTransaction } from "../lib/db";
import { invalidInput, ownerNotFound } from "../lib/errors";
import { NullableProps, selectOne } from "../lib/utils";

interface OwnerData {
  id: number;
  username: string;
  password: string;
  store_name?: string;
  store_description?: string;
  created_at: string;
  updated_at?: string;
}

const updateStoreInfoInputKeys = ["store_name", "store_description"] as const;
export type UpdateStoreInfoInput = NullableProps<
  Partial<Pick<OwnerData, typeof updateStoreInfoInputKeys[number]>>
>;

export type OwnerRow = RowDataPacket & OwnerData;

type OwnerCreateInput = Omit<OwnerData, "created_at" | "updated_at" | "id">;

export class OwnerModel {
  private readonly conn: Connection;
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

  async updateStoreInfo(
    id: number,
    storeInfo: UpdateStoreInfoInput
  ): Promise<void> {
    if (updateStoreInfoInputKeys.every((k) => storeInfo[k] === undefined))
      throw invalidInput("수정할 사항이 없습니다");
    await withTransaction(this.conn, async () => {
      for (const key of updateStoreInfoInputKeys) {
        if (key in storeInfo) {
          const [results] = await this.conn.execute<ResultSetHeader>(
            `UPDATE \`owner\` SET ${key}=? WHERE id=?`,
            [storeInfo[key], id]
          );
          if (results.affectedRows !== 1) throw ownerNotFound();
        }
      }
    });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await withTransaction(this.conn, async () => {
      const [result] = await this.conn.execute<ResultSetHeader>(
        "UPDATE `owner` SET password=? WHERE id=?",
        [password, id]
      );
      if (result.affectedRows !== 1) throw ownerNotFound();
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

  async getMany(): Promise<OwnerRow[]> {
    const [results] = await this.conn.query<OwnerRow[]>(
      "SELECT * FROM `owner`"
    );
    return results;
  }
}

export interface OwnerInfo {
  id: number;
  username: string;
  store_name?: string;
  store_description?: string;
  created_at: string;
  updated_at?: string;
}

export const ownerRowToInfo = (owner: OwnerRow): OwnerInfo => ({
  id: owner.id,
  username: owner.username,
  store_name: owner.store_name,
  store_description: owner.store_description,
  created_at: owner.created_at,
  updated_at: owner.updated_at,
});
