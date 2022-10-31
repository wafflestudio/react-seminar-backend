import { invalidLogin, refreshTokenInvalid } from "../lib/errors";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
} from "../lib/tokens";
import { OwnerModel } from "../owners/model";
import { OwnerDto, ownerToDto } from "../owners/schema";
import { RefreshTokenModel } from "./model";

interface LoginResult {
  owner: OwnerDto;
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
      owner: ownerToDto(owner),
    };
  }

  async logout(access_token: string, refresh_token: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.tokenModel.checkAndRemove(refresh_token, id);
  }

  async refresh(refresh_token: string): Promise<RefreshResult> {
    const owner = await this.ownerModel.getByRefreshToken(refresh_token);
    if (!owner) throw refreshTokenInvalid();
    await this.tokenModel.remove(refresh_token);
    const [access_token, new_refresh_token] = await Promise.all([
      createAccessToken(owner.username, owner.id),
      createRefreshToken(),
    ]);
    await this.tokenModel.insert(new_refresh_token, owner.id);
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
