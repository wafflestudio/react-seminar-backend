import { randomUUID } from "crypto";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./env";
import { accessTokenInvalid } from "./errors";

export const ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 10; // 10 minutes in ms
export const REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24; // 1 day in ms
interface AccessTokenPayload {
  username?: never;
  id: number;
}

export const REFRESH_TOKEN_KEY = "refresh_token";

export const createAccessToken = async (id: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const payload: AccessTokenPayload = { id };
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
        ? reject(accessTokenInvalid())
        : resolve(decoded as AccessTokenPayload & JwtPayload)
    );
  });

export const createRefreshToken = async () => randomUUID();
