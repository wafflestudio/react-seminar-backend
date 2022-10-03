import { ownerNotFound } from "../lib/errors";
import { verifyAccessToken } from "../lib/tokens";
import {
  OwnerInfo,
  OwnerModel,
  ownerRowToInfo,
  UpdateStoreInfoInput,
} from "./model";

export class OwnerService {
  private model: OwnerModel;
  constructor(model: OwnerModel) {
    this.model = model;
  }

  async getAll(): Promise<OwnerInfo[]> {
    const owners = await this.model.getMany();
    return owners.map((owner) => ownerRowToInfo(owner));
  }

  async getById(id: number): Promise<OwnerInfo> {
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerRowToInfo(owner);
  }

  async updateStoreInfo(access_token: string, storeInfo: UpdateStoreInfoInput) {
    const { id } = await verifyAccessToken(access_token);
    await this.model.updateStoreInfo(id, storeInfo);
  }

  async updatePassword(access_token: string, password: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.model.updatePassword(id, password);
  }

  async getMyInfo(access_token: string): Promise<OwnerInfo> {
    const { id } = await verifyAccessToken(access_token);
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerRowToInfo(owner);
  }
}
