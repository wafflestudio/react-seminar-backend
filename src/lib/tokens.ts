import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./env";
import { invalidToken } from "./errors";

export const ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 10; // 10 minutes
export const REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24; // 1 day
interface AccessTokenPayload {
  username: string;
  id: number;
}

export const COOKIE_TOKEN_KEY = "token";

export const createAccessToken = async (
  username: string,
  id: number
): Promise<string> =>
  new Promise((resolve, reject) => {
    const payload: AccessTokenPayload = { username, id };
    jsonwebtoken.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      },
      (error, encoded) => (error || !encoded ? reject(error) : resolve(encoded))
    );
  });
export const verifyAccessToken = async (
  token: string
): Promise<AccessTokenPayload & JwtPayload> =>
  new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, JWT_SECRET, (error, decoded) =>
      error || !decoded
        ? reject(invalidToken())
        : resolve(decoded as AccessTokenPayload & JwtPayload)
    );
  });
// eslint-disable-next-line @typescript-eslint/require-await
export const createRefreshToken = async () => randomUUID();

export function getAccessToken(request: FastifyRequest): string {
  const authorization = request.headers.authorization;
  if (!authorization) throw invalidToken();
  const split = authorization.indexOf(" ");
  const schema = authorization.slice(0, split);
  const token = authorization.slice(split + 1).trim();
  if (schema !== "Bearer") throw invalidToken();
  return token;
}

declare module "fastify" {
  interface FastifyReply {
    withToken(token: string): this;
    clearToken(): this;
  }
  interface FastifyRequest {
    token: string | null;
  }
}

export const tokenPlugin = fp(async (instance) => {
  instance.decorateRequest("token", null);
  instance.addHook("preHandler", async (request) => {
    request.token = request.cookies[COOKIE_TOKEN_KEY] ?? null;
    return Promise.resolve();
  });
  instance.decorateReply(
    "withToken",
    function (this: FastifyReply, token: string) {
      return this.setCookie(COOKIE_TOKEN_KEY, token, {
        httpOnly: true,
        sameSite: "strict",
      });
    }
  );
  instance.decorateReply("clearToken", function (this: FastifyReply) {
    return this.clearCookie(COOKIE_TOKEN_KEY);
  });
  return Promise.resolve();
});
