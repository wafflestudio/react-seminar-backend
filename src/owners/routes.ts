import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { invalidToken } from "../lib/errors";
import { STATUS } from "../lib/utils";
import {
  ownerSchema,
  passwordSchema,
  storeDescriptionSchema,
  storeNameSchema,
} from "../schema";

const routes: FastifyPluginAsync = async (instance) => {
  const { NO_CONTENT, OK } = STATUS;
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
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
        const token = request.getAccessToken();
        if (!token) throw invalidToken();
        const owner = await instance.ownerService.getMyInfo(token);
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
          body: Type.Object({
            store_name: Type.Optional(
              Type.Union([storeNameSchema, Type.Null()], {
                description:
                  "바꿀 때 string, 삭제할 때 null, 그대로 둘 때 not required",
              })
            ),
            store_description: Type.Optional(
              Type.Union([storeDescriptionSchema, Type.Null()], {
                description:
                  "바꿀 때 string, 삭제할 때 null, 그대로 둘 때 not required",
              })
            ),
          }),
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
    .patch(
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
        const access_token = request.getAccessToken();
        if (!access_token) throw invalidToken();
        await instance.ownerService.updatePassword(
          access_token,
          request.body.password
        );
        return reply.status(NO_CONTENT).send();
      }
    );
};

export default routes;
