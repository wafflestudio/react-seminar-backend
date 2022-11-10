import { PrismaClient } from "@prisma/client";
import { refreshTokenInvalid } from "../lib/errors";
import { REFRESH_TOKEN_EXPIRATION } from "../lib/tokens";
import { selectOne } from "../lib/utils";
import { FastifyBaseLogger } from "fastify";

export class RefreshTokenModel {
  conn: PrismaClient;
  log: FastifyBaseLogger;

  constructor(conn: PrismaClient, log: FastifyBaseLogger) {
    this.conn = conn;
    this.log = log;
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
    if (!tokenEntity) throw refreshTokenInvalid();
    await this.conn.refreshToken.delete({ where: { id: tokenEntity.id } });
  }

  async remove(refresh_token: string): Promise<void> {
    const _list = await this.conn.refreshToken.findMany({
      where: { token: refresh_token },
      select: { id: true },
    });
    const tokenEntity = selectOne(_list);
    if (!tokenEntity) throw refreshTokenInvalid();
    await this.conn.refreshToken
      .delete({ where: { id: tokenEntity.id } })
      .catch((reason) => {
        this.log.error(reason, "something went wrong");
        this.log.error(_list, "this was the tokens we've got");
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
