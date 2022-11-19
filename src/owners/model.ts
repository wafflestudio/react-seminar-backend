import { Owner, PrismaClient } from "@prisma/client";
import { ownerNotFound } from "../lib/errors";
import { selectOne } from "../lib/utils";
import {
  CreateOwnerInput,
  ListOwnerInput,
  OwnerWithRating,
  UpdateOwnerInput,
} from "./schema";

export class OwnerModel {
  private readonly conn: PrismaClient;

  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async getById(id: number): Promise<OwnerWithRating | null> {
    return this.conn.owner.findUnique({
      where: { id },
      include: {
        menus: { include: { reviews: { select: { rating: true } } } },
      },
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

  async getByUsername(username: string): Promise<OwnerWithRating | null> {
    return selectOne(
      await this.conn.owner.findMany({
        where: { username },
        include: {
          menus: { include: { reviews: { select: { rating: true } } } },
        },
      })
    );
  }

  async updateStoreInfo(
    id: number,
    storeInfo: UpdateOwnerInput
  ): Promise<Owner> {
    return await this.conn.owner
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

  async getMany(query: ListOwnerInput): Promise<OwnerWithRating[]> {
    return this.conn.owner.findMany({
      include: {
        menus: { include: { reviews: { select: { rating: true } } } },
      },
      where: query.name
        ? {
            OR: [
              { store_name: { contains: query.name } },
              { username: { contains: query.name } },
            ],
          }
        : undefined,
    });
  }
}
