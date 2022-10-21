import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { invalidToken } from "./errors";
import { REFRESH_TOKEN_EXPIRATION, REFRESH_TOKEN_KEY } from "./tokens";

declare module "fastify" {
  interface FastifyReply {
    withToken(token: string): this;
    clearToken(): this;
  }
  interface FastifyRequest {
    refreshToken: string | null;
    getAccessToken(): string;
  }
}

export const tokenPlugin = fp(async (instance) => {
  instance.decorateRequest("refreshToken", null);
  instance.addHook("preHandler", async (request) => {
    request.refreshToken = request.cookies[REFRESH_TOKEN_KEY] ?? null;
    return Promise.resolve();
  });
  instance.decorateRequest("getAccessToken", function (this: FastifyRequest) {
    const authorization = this.headers.authorization;
    if (!authorization) throw invalidToken();
    const split = authorization.indexOf(" ");
    const schema = authorization.slice(0, split);
    const token = authorization.slice(split + 1).trim();
    if (schema !== "Bearer") throw invalidToken();
    return token;
  });
  instance.decorateReply(
    "withToken",
    function (this: FastifyReply, token: string) {
      return this.setCookie(REFRESH_TOKEN_KEY, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      });
    }
  );
  instance.decorateReply("clearToken", function (this: FastifyReply) {
    return this.clearCookie(REFRESH_TOKEN_KEY);
  });
});
