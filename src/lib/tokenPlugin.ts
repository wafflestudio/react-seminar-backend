import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { accessTokenInvalid, accessTokenNotFound } from "./errors";
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

function extractDomain(origin?: string): string | undefined {
  return origin ? origin.slice(origin.search("://") + 3) : undefined;
}

export const tokenPlugin = fp(async (instance) => {
  instance.decorateRequest("refreshToken", null);
  instance.addHook("preHandler", async (request) => {
    request.refreshToken = request.cookies[REFRESH_TOKEN_KEY] ?? null;
    return Promise.resolve();
  });
  instance.decorateRequest("getAccessToken", function (this: FastifyRequest) {
    const authorization = this.headers.authorization;
    if (!authorization) throw accessTokenNotFound();
    const split = authorization.indexOf(" ");
    const schema = authorization.slice(0, split);
    const token = authorization.slice(split + 1).trim();
    if (schema !== "Bearer") throw accessTokenInvalid();
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
        path: "/auth",
        domain: extractDomain(this.request.headers.origin),
      });
    }
  );
  instance.decorateReply("clearToken", function (this: FastifyReply) {
    return this.clearCookie(REFRESH_TOKEN_KEY, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/auth",
      domain: extractDomain(this.request.headers.origin),
    });
  });
});
