import { PrismaClient } from "@prisma/client";
import { refreshTokenInvalid } from "../lib/errors";
import { REFRESH_TOKEN_EXPIRATION } from "../lib/tokens";
import { selectOne } from "../lib/utils";

export class RefreshTokenModel {
  conn: PrismaClient;

  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async insert(refresh_token: string, owner_id: number): Promise<void> {
    await this.conn.refreshToken.create({
      data: {
        token: refresh_token,
        owner_id,
        expiry: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      },
    });
  }

  async checkAndRemove(refresh_token: string, owner_id: number): Promise<void> {
    await this.conn.$transaction(async (tx) => {
      const { count } = await tx.refreshToken.deleteMany({
        where: { token: refresh_token, owner_id },
      });
      if (count !== 1) throw refreshTokenInvalid();
    });
  }

  async refreshAndGetOwnerId(
    old_token: string,
    new_token: string
  ): Promise<number> {
    return await this.conn.$transaction(async (tx) => {
      const tokenEntity = selectOne(
        await tx.refreshToken.findMany({
          where: { token: old_token },
          select: { id: true, owner_id: true },
        })
      );
      if (!tokenEntity) throw refreshTokenInvalid();
      await tx.refreshToken.update({
        where: { id: tokenEntity.id },
        data: {
          token: new_token,
          expiry: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
        },
      });
      return tokenEntity.owner_id;
    });
  }

  async purge(): Promise<void> {
    await this.conn.refreshToken.deleteMany({
      where: {
        expiry: {
          lt: new Date(),
        },
      },
    });
  }
}
