import { ownerNotFound } from "../lib/errors";
import { verifyAccessToken } from "../lib/tokens";
import { OwnerModel } from "./model";
import {
  ListOwnerInput,
  OwnerDto,
  OwnerDtoWithRating,
  ownerToDto,
  ownerWithRatingToDto,
  UpdateOwnerInput,
} from "./schema";

export class OwnerService {
  private model: OwnerModel;
  constructor(model: OwnerModel) {
    this.model = model;
  }

  async getAll(query: ListOwnerInput): Promise<OwnerDtoWithRating[]> {
    const owners = await this.model.getMany(query);
    return owners.map((owner) => ownerWithRatingToDto(owner));
  }

  async getById(id: number): Promise<OwnerDtoWithRating> {
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerWithRatingToDto(owner);
  }

  async updateStoreInfo(
    access_token: string,
    storeInfo: UpdateOwnerInput
  ): Promise<OwnerDto> {
    const { id } = await verifyAccessToken(access_token);
    const result = await this.model.updateStoreInfo(id, storeInfo);
    return ownerToDto(result);
  }

  async updatePassword(access_token: string, password: string): Promise<void> {
    const { id } = await verifyAccessToken(access_token);
    await this.model.updatePassword(id, password);
  }

  async getMyInfo(access_token: string): Promise<OwnerDtoWithRating> {
    const { id } = await verifyAccessToken(access_token);
    const owner = await this.model.getById(id);
    if (!owner) throw ownerNotFound();
    return ownerWithRatingToDto(owner);
  }
}
