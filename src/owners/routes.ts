import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { STATUS } from "../lib/utils";
import {
  ownerRef,
  ownerSchema,
  passwordSchema,
} from "./schema";
import { bearerSecurity } from "../auth/schema";

const routes: FastifyPluginAsync = async (instance) => {
  const { OK } = STATUS;
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .get(
      "/me",
      {
        schema: {
          summary: "내 정보",
          description: "로그인한 사용자의 정보를 가져옵니다.",
          security: [bearerSecurity],
          response: {
            [OK]: Type.Object({
              user: ownerRef,
            }),
          },
        },
      },
      async (request, reply) => {
        const user = await instance.ownerService.getMyInfo(
          request.getAccessToken()
        );
        return reply.send({ user });
      }
    )
    .get(
      "/:id",
      {
        schema: {
          summary: "사용자 정보",
          description: "해당하는 id의 사장님의 정보를 가져옵니다.",
          params: Type.Object({
            id: ownerSchema.properties.id,
          }),
          response: {
            [OK]: Type.Object({
              user: ownerRef,
            }),
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params;
        const user = await instance.ownerService.getById(id);
        return reply.send({ user });
      }
    )
    .put(
      "/me/password",
      {
        schema: {
          summary: "패스워드 변경",
          description: "로그인한 사장님의 패스워드를 변경합니다",
          security: [bearerSecurity],
          body: Type.Object({
            password: passwordSchema,
          }),
          response: {
            [OK]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        await instance.ownerService.updatePassword(
          request.getAccessToken(),
          request.body.password
        );
        return reply.send();
      }
    );
};

export default routes;
