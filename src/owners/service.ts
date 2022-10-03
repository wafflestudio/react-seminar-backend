import { ownerNotFound } from "../lib/errors";
import { verifyAccessToken } from "../lib/tokens";
import { OwnerInfo, OwnerModel, ownerRowToInfo } from "./model";

export class OwnerService {
  private model: OwnerModel;
  constructor(model: OwnerModel) {
    this.model = model;
  }
  async getById(id: number): Promise<OwnerInfo> {
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return {
      id: owner.id,
      username: owner.username,
      store_name: owner.store_name,
      store_description: owner.store_description,
      created_at: owner.created_at,
      updated_at: owner.updated_at,
    };
  }

  async updateStoreName(
    access_token: string,
    storeName: string
  ): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.model.updateStoreName(id, storeName);
  }

  async updatePassword(access_token: string, password: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.model.updatePassword(id, password);
  }

  async me(access_token: string): Promise<OwnerInfo> {
    const { id } = await verifyAccessToken(access_token);
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerRowToInfo(owner);
  }
}
