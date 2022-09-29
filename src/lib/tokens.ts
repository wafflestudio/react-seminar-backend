import { randomUUID } from "crypto";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./env";

export const ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 10; // 10 minutes
export const REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24; // 1 day
interface AccessTokenPayload {
  username: string;
}

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
