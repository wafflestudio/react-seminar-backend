import { Owner, Prisma, PrismaClient } from "@prisma/client";
import { invalidInput, ownerNotFound } from "../lib/errors";
import { NullableProps, selectOne } from "../lib/utils";

const updateStoreInfoInputKeys = ["store_name", "store_description"] as const;
export type UpdateStoreInfoInput = NullableProps<
  Partial<Pick<Owner, typeof updateStoreInfoInputKeys[number]>>
>;

type OwnerCreateInput = Omit<
  Prisma.OwnerCreateManyInput,
  "id" | "created_at" | "updated_at"
>;

export class OwnerModel {
  private readonly conn: PrismaClient;
  constructor(conn: PrismaClient) {
    this.conn = conn;
  }
  async getById(id: number): Promise<Owner | null> {
    return this.conn.owner.findUnique({
      where: { id },
    });
  }

  async getByRefreshToken(token: string): Promise<Owner | null> {
    return (
      selectOne(
        await this.conn.refreshToken.findMany({
          where: { token },
          select: {
            owner: true,
          },
        })
      )?.owner ?? null
    );
  }

  async getByUsername(username: string): Promise<Owner | null> {
    return selectOne(
      await this.conn.owner.findMany({
        where: { username },
      })
    );
  }

  async updateStoreInfo(
    id: number,
    storeInfo: UpdateStoreInfoInput
  ): Promise<void> {
    if (updateStoreInfoInputKeys.every((k) => storeInfo[k] === undefined))
      throw invalidInput("수정할 사항이 없습니다");
    await this.conn.owner
      .update({
        where: { id },
        data: storeInfo,
      })
      .catch(() => {
        throw ownerNotFound();
      });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.conn.owner.update({
      where: { id },
      data: { password },
    });
  }

  async insertMany(inputs: OwnerCreateInput[]): Promise<void> {
    await this.conn.owner.createMany({
      data: inputs,
    });
  }

  async getMany(): Promise<Owner[]> {
    return this.conn.owner.findMany();
  }
}
