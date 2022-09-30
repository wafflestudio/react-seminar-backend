import {
  raiseInvalidLogin,
  raiseInvalidToken,
  raiseOwnerNotFound,
} from "../lib/errors";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
} from "../lib/tokens";
import { nullify } from "../lib/utils";
import {
  getOwnerByRefreshToken,
  getOwnerByUsername,
  OwnerRow,
} from "../owners/models";
import { insertRefreshToken, removeRefreshToken } from "./models";

interface OwnerInfo {
  id: number;
  username: string;
  store_name?: string;
  store_description?: string;
  created_at: string;
  updated_at?: string;
}

const ownerRowToInfo = (owner: OwnerRow): OwnerInfo => ({
  id: owner.id,
  username: owner.username,
  store_name: owner.store_name,
  store_description: owner.store_description,
  created_at: owner.created_at,
  updated_at: owner.updated_at,
});

interface LoginResult {
  owner: OwnerInfo;
  access_token: string;
  refresh_token: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  const owner = await getOwnerByUsername(username);
  // TODO: password encryption
  if (owner?.password !== password) return raiseInvalidLogin();

  const [access_token, refresh_token] = await Promise.all([
    createAccessToken(owner.username),
    createRefreshToken(),
  ]);
  await insertRefreshToken(refresh_token, owner.id);

  return {
    access_token,
    refresh_token,
    owner: ownerRowToInfo(owner),
  };
}

export async function logout(refresh_token: string): Promise<void> {
  if (!(await removeRefreshToken(refresh_token))) return raiseInvalidToken();
}

export interface RefreshResult {
  access_token: string;
  refresh_token: string;
}

export async function refresh(refresh_token: string): Promise<RefreshResult> {
  const ownerToken = await getOwnerByRefreshToken(refresh_token);
  if (!ownerToken) return raiseInvalidToken();
  if (!(await removeRefreshToken(refresh_token))) return raiseInvalidToken();
  const [access_token, new_refresh_token] = await Promise.all([
    createAccessToken(ownerToken.username),
    createRefreshToken(),
  ]);
  return {
    access_token,
    refresh_token: new_refresh_token,
  };
}

export async function me(access_token: string): Promise<OwnerInfo> {
  const verification = await nullify(() => verifyAccessToken(access_token));
  if (!verification) return raiseInvalidToken();
  const owner = await getOwnerByUsername(verification.username);
  if (!owner) return raiseOwnerNotFound();
  return ownerRowToInfo(owner);
}
