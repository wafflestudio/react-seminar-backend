import { invalidLogin } from "../lib/errors";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
} from "../lib/tokens";
import { OwnerModel } from "../owners/model";
import { OwnerDto, ownerToDto } from "../owners/schema";
import { RefreshTokenModel } from "./model";

interface LoginResult {
  user: OwnerDto;
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
      createAccessToken(owner.id),
      createRefreshToken(),
    ]);
    await this.tokenModel.insert(refresh_token, owner.id);

    return {
      access_token,
      refresh_token,
      user: ownerToDto(owner),
    };
  }

  async logout(access_token: string, refresh_token: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.tokenModel.checkAndRemove(refresh_token, id);
  }

  async refresh(old_token: string): Promise<RefreshResult> {
    const refresh_token = await createRefreshToken();
    const ownerId = await this.tokenModel.refreshAndGetOwnerId(
      old_token,
      refresh_token
    );
    const access_token = await createAccessToken(ownerId);
    return {
      access_token,
      refresh_token,
    };
  }
}

interface RefreshResult {
  access_token: string;
  refresh_token: string;
}
