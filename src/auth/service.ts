import { invalidLogin, invalidToken } from "../lib/errors";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
} from "../lib/tokens";
import { OwnerInfo, OwnerModel, ownerRowToInfo } from "../owners/model";
import { RefreshTokenModel } from "./tokenModel";

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
    if (owner?.password !== password) throw invalidLogin();

    const [access_token, refresh_token] = await Promise.all([
      createAccessToken(owner.username, owner.id),
      createRefreshToken(),
    ]);
    await this.tokenModel.insert(refresh_token, owner.id);

    return {
      access_token,
      refresh_token,
      owner: ownerRowToInfo(owner),
    };
  }

  async logout(access_token: string, refresh_token: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.tokenModel.checkAndRemove(refresh_token, id);
  }

  async refresh(refresh_token: string): Promise<RefreshResult> {
    const ownerToken = await this.ownerModel.getByRefreshToken(refresh_token);
    if (!ownerToken) throw invalidToken();
    await this.tokenModel.remove(refresh_token);
    const [access_token, new_refresh_token] = await Promise.all([
      createAccessToken(ownerToken.username, ownerToken.owner_id),
      createRefreshToken(),
    ]);
    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }
}

interface RefreshResult {
  access_token: string;
  refresh_token: string;
}
