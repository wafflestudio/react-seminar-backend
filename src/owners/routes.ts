import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { invalidToken } from "../lib/errors";
import { STATUS } from "../lib/utils";
import { ownerSchema, passwordSchema, updateOwnerSchema } from "./schema";

const routes: FastifyPluginAsync = async (instance) => {
  const { NO_CONTENT, OK } = STATUS;
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .get(
      "/",
      {
        schema: {
          response: { [OK]: Type.Array(ownerSchema) },
        },
      },
      async (request, reply) => {
        const owners = await instance.ownerService.getAll();
        request.log.debug(owners[0], "owners[0]");
        return reply.send(owners);
      }
    )
    .get(
      "/me",
      {
        schema: {
          response: {
            [OK]: Type.Object({
              owner: ownerSchema,
            }),
          },
        },
      },
      async (request, reply) => {
        const owner = await instance.ownerService.getMyInfo(
          request.getAccessToken()
        );
        return reply.send({ owner });
      }
    )
    .get(
      "/:id",
      {
        schema: {
          params: Type.Object({
            id: Type.Integer(),
          }),
          response: {
            [OK]: Type.Object({
              owner: ownerSchema,
            }),
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params;
        const owner = await instance.ownerService.getById(id);
        return reply.send({ owner });
      }
    )
    .patch(
      "/me",
      {
        schema: {
          body: updateOwnerSchema,
          response: {
            [NO_CONTENT]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        const access_token = request.getAccessToken();
        if (!access_token) throw invalidToken();
        await instance.ownerService.updateStoreInfo(access_token, request.body);
        return reply.status(NO_CONTENT).send();
      }
    )
    .put(
      "/me/password",
      {
        schema: {
          body: Type.Object({
            password: passwordSchema,
          }),
          response: {
            [NO_CONTENT]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        await instance.ownerService.updatePassword(
          request.getAccessToken(),
          request.body.password
        );
        return reply.status(NO_CONTENT).send();
      }
    );
};

export default routes;
