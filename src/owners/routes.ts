import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { invalidToken } from "../lib/errors";
import { STATUS } from "../lib/utils";
import {
  ownerRef,
  ownerSchema,
  passwordSchema,
  updateOwnerSchema,
} from "./schema";
import { bearerSecurity } from "../auth/schema";

const routes: FastifyPluginAsync = async (instance) => {
  const { OK } = STATUS;
  instance
    .withTypeProvider<TypeBoxTypeProvider>()
    .get(
      "/",
      {
        schema: {
          summary: "사장님 목록",
          description:
            "모든 사장님의 목록을 가져옵니다. 참고로 사장님=사용자입니다.",
          response: { [OK]: Type.Array(ownerRef) },
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
          summary: "내 정보",
          description: "로그인한 사장님의 정보를 가져옵니다.",
          security: [bearerSecurity],
          response: {
            [OK]: Type.Object({
              owner: ownerRef,
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
          summary: "사장님 정보",
          description: "해당하는 id의 사장님의 정보를 가져옵니다.",
          params: Type.Object({
            id: ownerSchema.properties.id,
          }),
          response: {
            [OK]: Type.Object({
              owner: ownerRef,
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
          summary: "내 정보 수정",
          description: "로그인한 사장님의 가게의 별명과 설명을 수정합니다",
          security: [bearerSecurity],
          body: updateOwnerSchema,
          response: {
            [OK]: ownerRef,
          },
        },
      },
      async (request, reply) => {
        const access_token = request.getAccessToken();
        if (!access_token) throw invalidToken();
        const result = await instance.ownerService.updateStoreInfo(
          access_token,
          request.body
        );
        return reply.send(result);
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
