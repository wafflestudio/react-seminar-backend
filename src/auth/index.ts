import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { raiseInvalidToken } from "../lib/errors";
import { ownerSchema } from "./schema";
import { login, logout, me, refresh } from "./service";

// eslint-disable-next-line @typescript-eslint/require-await
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
        const { owner, access_token, refresh_token } = await login(
          username,
          password
        );
        return reply.withToken(refresh_token).send({
          owner,
          access_token,
        });
      }
    )
    .post("/logout", async (request, reply) => {
      const { token } = request;
      if (!token) raiseInvalidToken();
      await logout(token);
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
        const { access_token, refresh_token } = await refresh(
          old_refresh_token
        );
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
        const owner = await me(token);
        return reply.send({ owner });
      }
    );
};

export default routes;
