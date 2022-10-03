import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { invalidToken } from "../lib/errors";
import { ownerSchema } from "./schema";

const routes: FastifyPluginAsync = async (instance) => {
  instance.withTypeProvider<TypeBoxTypeProvider>().get(
    "/me",
    {
      schema: {
        response: {
          200: Type.Object({
            owner: ownerSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const token = request.token;
      if (!token) throw invalidToken();
      const owner = await instance.ownerService.me(token);
      return reply.send({ owner });
    }
  );
  return Promise.resolve();
};

export default routes;
