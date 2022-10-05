import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { invalidToken } from "../lib/errors";
import { ownerRef, ownerSchema, passwordSchema } from "../owners/schema";
import { bearerSecurity } from "./schema";
import { STATUS } from "../lib/utils";

const routes: FastifyPluginAsync = async (instance) => {
  const { OK } = STATUS;
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .post(
      "/login",
      {
        schema: {
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
          security: [bearerSecurity],
          response: {
            [OK]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        const refresh_token = request.refreshToken;
        const access_token = request.getAccessToken();
        if (!refresh_token || !access_token) throw invalidToken();
        await instance.authService.logout(access_token, refresh_token);
        return reply.clearToken().send();
      }
    )
    .post(
      "/refresh",
      {
        schema: {
          response: {
            [OK]: Type.Object({
              access_token: Type.String(),
            }),
          },
        },
      },
      async (request, reply) => {
        const old_refresh_token = request.refreshToken;
        if (!old_refresh_token) throw invalidToken();
        const { access_token, refresh_token } =
          await instance.authService.refresh(old_refresh_token);
        return reply.withToken(refresh_token).send({
          access_token,
        });
      }
    );
};

export default routes;
