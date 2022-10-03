import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { invalidToken } from "../lib/errors";
import { ownerSchema, passwordSchema, usernameSchema } from "../owners/schema";

const routes: FastifyPluginAsync = async (instance) => {
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .post(
      "/login",
      {
        schema: {
          body: Type.Object({
            username: usernameSchema,
            password: passwordSchema,
          }),
          response: {
            200: Type.Object({
              owner: ownerSchema,
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
          body: Type.Object({
            access_token: Type.String(),
          }),
        },
      },
      async (request, reply) => {
        const refresh_token = request.token;
        const access_token = request.body.access_token;
        if (!refresh_token) throw invalidToken();
        await instance.authService.logout(access_token, refresh_token);
        return reply.clearToken().send();
      }
    )
    .post(
      "/refresh",
      {
        schema: {
          response: {
            200: Type.Object({
              access_token: Type.String(),
            }),
          },
        },
      },
      async (request, reply) => {
        const old_refresh_token = request.token;
        if (!old_refresh_token) throw invalidToken();
        const { access_token, refresh_token } =
          await instance.authService.refresh(old_refresh_token);
        return reply.withToken(refresh_token).send({
          access_token,
        });
      }
    );
  return Promise.resolve();
};

export default routes;
