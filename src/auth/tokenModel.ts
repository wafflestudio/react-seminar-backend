import { PrismaClient } from "@prisma/client";
import { invalidToken } from "../lib/errors";
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
    const tokenEntity = selectOne(
      await this.conn.refreshToken.findMany({
        where: { token: refresh_token, owner_id },
        select: { id: true },
      })
    );
    if (!tokenEntity) throw invalidToken();
    await this.conn.refreshToken.delete({ where: { id: tokenEntity.id } });
  }

  async remove(refresh_token: string): Promise<void> {
    const tokenEntity = selectOne(
      await this.conn.refreshToken.findMany({
        where: { token: refresh_token },
        select: { id: true },
      })
    );
    if (!tokenEntity) throw invalidToken();
    await this.conn.refreshToken.delete({ where: { id: tokenEntity.id } });
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
