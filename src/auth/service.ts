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
import { OwnerModel, OwnerRow } from "../owners/model";
import { RefreshTokenModel } from "./tokenModel";

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

export class AuthService {
  private ownerModel: OwnerModel;
  private tokenModel: RefreshTokenModel;
  constructor(ownerModel: OwnerModel, tokenModel: RefreshTokenModel) {
    this.ownerModel = ownerModel;
    this.tokenModel = tokenModel;
  }
  async login(username: string, password: string): Promise<LoginResult> {
    const owner = await this.ownerModel.getByUsername(username);
    if (owner?.password !== password) return raiseInvalidLogin();

    const [access_token, refresh_token] = await Promise.all([
      createAccessToken(owner.username),
      createRefreshToken(),
    ]);
    await this.tokenModel.insert(refresh_token, owner.id);

    return {
      access_token,
      refresh_token,
      owner: ownerRowToInfo(owner),
    };
  }

  async logout(refresh_token: string): Promise<void> {
    await this.tokenModel.remove(refresh_token);
  }

  async refresh(refresh_token: string): Promise<RefreshResult> {
    const ownerToken = await this.ownerModel.getByRefreshToken(refresh_token);
    if (!ownerToken) return raiseInvalidToken();
    await this.tokenModel.remove(refresh_token);
    const [access_token, new_refresh_token] = await Promise.all([
      createAccessToken(ownerToken.username),
      createRefreshToken(),
    ]);
    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }

  async me(access_token: string): Promise<OwnerInfo> {
    const verification = await nullify(() => verifyAccessToken(access_token));
    if (!verification) return raiseInvalidToken();
    const owner = await this.ownerModel.getByUsername(verification.username);
    if (!owner) return raiseOwnerNotFound();
    return ownerRowToInfo(owner);
  }
}

interface RefreshResult {
  access_token: string;
  refresh_token: string;
}
