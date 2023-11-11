import { ownerNotFound } from "../lib/errors";
import { verifyAccessToken } from "../lib/tokens";
import { OwnerModel } from "./model";
import {
  OwnerDto,
  ownerToDto,
} from "./schema";

export class OwnerService {
  private model: OwnerModel;
  constructor(model: OwnerModel) {
    this.model = model;
  }

  async getById(id: number): Promise<OwnerDto> {
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerToDto(owner);
  }

  async updatePassword(access_token: string, password: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.model.updatePassword(id, password);
  }

  async getMyInfo(access_token: string): Promise<OwnerDto> {
    const { id } = await verifyAccessToken(access_token);
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerToDto(owner);
  }
}
