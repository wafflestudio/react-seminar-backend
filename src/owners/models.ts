import { ResultSetHeader, RowDataPacket } from "mysql2";
import { execute } from "../lib/db";
import { RefreshTokenRow } from "../auth/models";

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

const selectOne = <T>(arr: T[]): T | null => (arr.length === 1 ? arr[0] : null);

export const getOwnerById = async (id: number): Promise<OwnerRow | null> =>
  selectOne(
    await execute<OwnerRow[]>("SELECT * FROM `owner` WHERE id=?", [id])
  );

export const getOwnerByRefreshToken = async (
  refresh_token: string
): Promise<(OwnerRow & RefreshTokenRow) | null> =>
  selectOne(
    await execute<(OwnerRow & RefreshTokenRow)[]>(
      "SELECT * FROM `owner` RIGHT JOIN RefreshToken RT on `owner`.id = RT.owner_id WHERE refresh_token = ? AND expiry >= NOW()",
      [refresh_token]
    )
  );

export const getOwnerByUsername = async (
  username: string
): Promise<OwnerRow | null> =>
  selectOne(
    await execute<OwnerRow[]>("SELECT * FROM `owner` WHERE username = ?", [
      username,
    ])
  );

export const updateOwnerStoreName = async (
  id: number,
  storeName: string
): Promise<void> =>
  void (await execute("UPDATE `owner` SET store_name=? WHERE id=?", [
    storeName,
    id,
  ]));

export async function updateOwnerPassword(
  id: number,
  password: string
): Promise<boolean> {
  const result = await execute<ResultSetHeader>(
    "UPDATE `owner` SET password=? WHERE id=?",
    [password, id]
  );
  return result.affectedRows === 1;
}

export const createOwners = async (
  inputs: OwnerCreateInput[]
): Promise<void> => {
  const params: (string | null)[] = inputs.flatMap((input) => [
    input.username,
    input.password,
    input.store_name ?? null,
    input.store_description ?? null,
  ]);
  void (await execute(
    "INSERT INTO `owner` (username, password, store_name, store_description) VALUES " +
      inputs.map(() => "(?, ?, ?, ?)").join(", "),
    params
  ));
};
