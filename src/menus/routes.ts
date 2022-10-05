import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  createMenuSchema,
  editMenuSchema,
  menuSchema,
  paginationAnchor,
  searchMenuOptionSchema,
} from "./schema";
import { STATUS } from "../lib/utils";
import { Type } from "@sinclair/typebox";
import { bearerSecurity } from "../auth/schema";

const routes: FastifyPluginAsyncTypebox = async (instance) => {
  const { OK } = STATUS;
  instance
    .get(
      "/",
      {
        schema: {
          querystring: searchMenuOptionSchema,
          response: {
            [OK]: Type.Object({
              data: Type.Array(menuSchema),
              next: paginationAnchor,
            }),
          },
        },
      },
      async (request, reply) => {
        const payload = await instance.menuService.search(request.query);
        return reply.send(payload);
      }
    )
    .get(
      "/:id",
      {
        schema: {
          params: Type.Object({ id: Type.Integer() }),
          response: {
            [OK]: menuSchema,
          },
        },
      },
      async (request, reply) => {
        const menu = await instance.menuService.getById(request.params.id);
        return reply.send(menu);
      }
    )
    .post(
      "/:id",
      {
        schema: {
          security: [bearerSecurity],
          params: Type.Object({ id: Type.Integer() }),
          body: createMenuSchema,
          response: {
            [OK]: menuSchema,
          },
        },
      },
      async (request, reply) => {
        const menu = await instance.menuService.create(
          request.getAccessToken(),
          request.body
        );
        return reply.send(menu);
      }
    )
    .patch(
      "/:id",
      {
        schema: {
          security: [bearerSecurity],
          params: Type.Object({ id: Type.Integer() }),
          body: editMenuSchema,
          response: {
            [OK]: menuSchema,
          },
        },
      },
      async (request, reply) => {
        const menu = await instance.menuService.edit(
          request.getAccessToken(),
          request.params.id,
          request.body
        );
        return reply.send(menu);
      }
    )
    .delete(
      "/:id",
      {
        schema: {
          security: [bearerSecurity],
          params: Type.Object({ id: Type.Integer() }),
          response: {
            [OK]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        await instance.menuService.remove(
          request.getAccessToken(),
          request.params.id
        );
        return reply.send();
      }
    );
};

export default routes;
