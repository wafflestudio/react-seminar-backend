import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { raiseInvalidToken } from "../lib/errors";
import { ownerSchema } from "./schema";

const routes: FastifyPluginAsync = async (instance) => {
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .post(
      "/login",
      {
        schema: {
          body: Type.Object({
            username: Type.String(),
            password: Type.String(),
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
    .post("/logout", async (request, reply) => {
      const { token } = request;
      if (!token) raiseInvalidToken();
      await instance.authService.logout(token);
      return reply.clearToken().send();
    })
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
        if (!old_refresh_token) raiseInvalidToken();
        const { access_token, refresh_token } =
          await instance.authService.refresh(old_refresh_token);
        return reply.withToken(refresh_token).send({
          access_token,
        });
      }
    )
    .get(
      "/me",
      {
        schema: {
          response: {
            200: {
              owner: ownerSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const token = request.token;
        if (!token) raiseInvalidToken();
        const owner = await instance.authService.me(token);
        return reply.send({ owner });
      }
    );
  return Promise.resolve();
};

export default routes;
