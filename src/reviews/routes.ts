import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { PaginationResponse } from "../lib/schema";
import {
  createReviewSchema,
  reviewRef,
  reviewSchema,
  searchReviewSchema,
  updateReviewSchema,
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
          summary: "리뷰 목록",
          description:
            "리뷰의 목록을 가져옵니다. 메뉴 id를 반드시 지정해야 합니다",
          querystring: searchReviewSchema,
          response: {
            [OK]: PaginationResponse(reviewRef),
          },
        },
      },
      async (request, reply) => {
        const payload = await instance.reviewService.list(request.query);
        return reply.send(payload);
      }
    )
    .get(
      "/:id",
      {
        schema: {
          summary: "리뷰 가져오기",
          description:
            "id에 해당하는 리뷰를 가져옵니다. 아마 이 API는 쓸 일 없을 겁니다.",
          params: Type.Object({ id: reviewSchema.properties.id }),
          response: {
            [OK]: reviewRef,
          },
        },
      },
      async (request, reply) => {
        const review = await instance.reviewService.getById(request.params.id);
        return reply.send(review);
      }
    )
    .post(
      "/",
      {
        schema: {
          summary: "리뷰 생성",
          description: "새로운 리뷰를 생성합니다",
          security: [bearerSecurity],
          body: createReviewSchema,
          response: {
            [OK]: reviewRef,
          },
        },
      },
      async (request, reply) => {
        const review = await instance.reviewService.create(
          request.getAccessToken(),
          request.body
        );
        return reply.send(review);
      }
    )
    .patch(
      "/:id",
      {
        schema: {
          summary: "리뷰 수정",
          description: "리뷰를 수정합니다. 자신의 리뷰만 수정할 수 있습니다.",
          security: [bearerSecurity],
          params: Type.Object({ id: reviewSchema.properties.id }),
          body: updateReviewSchema,
          response: {
            [OK]: reviewRef,
          },
        },
      },
      async (request, reply) => {
        const review = await instance.reviewService.update(
          request.getAccessToken(),
          request.params.id,
          request.body
        );
        return reply.send(review);
      }
    )
    .delete(
      "/:id",
      {
        schema: {
          summary: "리뷰 삭제",
          description: "리뷰를 삭제합니다. 자신의 리뷰만 삭제할 수 있습니다.",
          security: [bearerSecurity],
          params: Type.Object({ id: reviewSchema.properties.id }),
          response: {
            [OK]: Type.Void(),
          },
        },
      },
      async (request, reply) => {
        await instance.reviewService.remove(
          request.getAccessToken(),
          request.params.id
        );
        return reply.send();
      }
    );
};

export default routes;
