import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { PaginationResponse } from "../lib/schema";
import {
  createMenuSchema,
  editMenuSchema,
  menuRef,
  menuSchema,
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
          summary: "메뉴 목록",
          description: "메뉴 목록을 가져옵니다. 여러가지 옵션도 넣어보세요",
          querystring: searchMenuOptionSchema,
          response: {
            [OK]: PaginationResponse(menuRef),
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
          summary: "메뉴 가져오기",
          description: "해당 id의 메뉴를 가져옵니다",
          params: Type.Object({ id: menuSchema.properties.id }),
          response: {
            [OK]: menuRef,
          },
        },
      },
      async (request, reply) => {
        const menu = await instance.menuService.getById(request.params.id);
        return reply.send(menu);
      }
    )
    .post(
      "/",
      {
        schema: {
          summary: "메뉴 생성",
          description: "현재 로그인한 사장님의 가게에 새로운 메뉴를 생성합니다",
          security: [bearerSecurity],
          body: createMenuSchema,
          response: {
            [OK]: menuRef,
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
          summary: "메뉴 수정",
          description:
            "메뉴를 수정합니다. 자신의 가게에 있는 메뉴만 수정할 수 있습니다.",
          security: [bearerSecurity],
          params: Type.Object({ id: menuSchema.properties.id }),
          body: editMenuSchema,
          response: {
            [OK]: menuRef,
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
          summary: "메뉴 삭제",
          description:
            "메뉴를 삭제합니다. 자신의 가게에 있는 메뉴만 삭제할 수 있습니다.",
          security: [bearerSecurity],
          params: Type.Object({ id: menuSchema.properties.id }),
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
