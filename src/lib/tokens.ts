import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./env";
import { raiseInvalidToken } from "./errors";

export const ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 10; // 10 minutes
export const REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24; // 1 day
interface AccessTokenPayload {
  username: string;
}

export const COOKIE_TOKEN_KEY = "token";

export const createAccessToken = async (username: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const payload: AccessTokenPayload = { username };
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
        ? reject(error)
        : resolve(decoded as AccessTokenPayload & JwtPayload)
    );
  });
// eslint-disable-next-line @typescript-eslint/require-await
export const createRefreshToken = async () => randomUUID();

export function getAccessToken(request: FastifyRequest): string {
  const authorization = request.headers.authorization;
  if (!authorization) return raiseInvalidToken();
  const split = authorization.indexOf(" ");
  const schema = authorization.slice(0, split);
  const token = authorization.slice(split + 1).trim();
  if (schema !== "Bearer") return raiseInvalidToken();
  return token;
}

export function getRefreshToken(request: FastifyRequest): string {
  const token = request.cookies[COOKIE_TOKEN_KEY];
  if (!token) return raiseInvalidToken();
  return token;
}

export async function setRefreshToken<T extends FastifyReply>(
  reply: T,
  token: string
): Promise<T> {
  return reply.setCookie(COOKIE_TOKEN_KEY, token, { httpOnly: true });
}
