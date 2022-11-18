import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { refreshTokenNotFound } from "../lib/errors";
import { ownerRef, ownerSchema, passwordSchema } from "../owners/schema";
import { bearerSecurity } from "./schema";
import { STATUS } from "../lib/utils";
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from "../lib/tokens";

const routes: FastifyPluginAsync = async (instance) => {
  const { OK } = STATUS;
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .post(
      "/login",
      {
        schema: {
          summary: "로그인",
          description: `JWT 액세스 토큰과 리프레시 토큰을 생성합니다. 리프레시 토큰은 쿠키에 들어가요. 리프레시 토큰과 액세스 토큰은 각각 ${REFRESH_TOKEN_EXPIRATION.asMinutes()}, ${ACCESS_TOKEN_EXPIRATION.asMinutes()}분 후에 만료됩니다`,
          body: Type.Object({
            username: ownerSchema.properties.username,
            password: passwordSchema,
          }),
          response: {
            [OK]: Type.Object({
              owner: ownerRef,
              access_token: Type.String(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { username, password } = request.body;
        const { owner, access_token, refresh_token } =
          await instance.authService.login(username, password);
        return reply.withToken(refresh_token).send({
          owner,
          access_token,
        });
      }
    )
    .post(
      "/logout",
      {
        schema: {
          summary: "로그아웃",
          description: "리프레시 토큰을 삭제합니다.",
          security: [bearerSecurity],
          response: {
            [OK]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        const refresh_token = request.refreshToken;
        const access_token = request.getAccessToken();
        if (!refresh_token) throw refreshTokenNotFound();
        await instance.authService.logout(access_token, refresh_token);
        return reply.clearToken().send();
      }
    )
    .post(
      "/refresh",
      {
        schema: {
          summary: "토큰 재발급",
          description:
            "JWT 토큰과 리프레시 토큰을 재발급합니다. 당연히 리프레시 토큰이 없으면 재발급 안 됩니다",
          response: {
            [OK]: Type.Object({
              access_token: Type.String(),
            }),
          },
        },
      },
      async (request, reply) => {
        const old_refresh_token = request.refreshToken;
        if (!old_refresh_token) throw refreshTokenNotFound();
        const { access_token, refresh_token } =
          await instance.authService.refresh(old_refresh_token);
        return reply.withToken(refresh_token).send({
          access_token,
        });
      }
    );
};

export default routes;
