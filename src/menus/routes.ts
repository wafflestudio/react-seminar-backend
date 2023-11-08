import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  createMenuSchema,
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
          summary: "과자 목록",
          description: "과자 목록을 가져옵니다. 여러가지 옵션도 넣어보세요",
          querystring: searchMenuOptionSchema,
          response: {
            [OK]: Type.Array(menuRef),
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
          summary: "과자 가져오기",
          description: "해당 id의 과자를 가져옵니다",
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
          summary: "과자 생성",
          description:
            "새로운 과자를 생성합니다. 기존 과자와 같은 이름으로는 생성할 수 없습니다. 로그인을 해야 사용할 수 있습니다.",
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
    );
};

export default routes;
