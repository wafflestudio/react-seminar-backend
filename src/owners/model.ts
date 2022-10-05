import { Owner, PrismaClient } from "@prisma/client";
import { ownerNotFound } from "../lib/errors";
import { selectOne } from "../lib/utils";
import { CreateOwnerInput, UpdateOwnerInput } from "./schema";

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
    storeInfo: UpdateOwnerInput
  ): Promise<void> {
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
    await this.conn.owner
      .update({
        where: { id },
        data: { password },
      })
      .catch(() => {
        throw ownerNotFound();
      });
  }

  async insertMany(inputs: CreateOwnerInput[]): Promise<void> {
    await this.conn.owner.createMany({
      data: inputs,
    });
  }

  async getMany(): Promise<Owner[]> {
    return this.conn.owner.findMany();
  }
}
