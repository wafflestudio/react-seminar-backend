import { Static, Type } from "@sinclair/typebox";
import { AtLeastOneProp, paginationRequest } from "../lib/schema";
import { menuRef, menuSchema, menuToDto, MenuWithOwner } from "../menus/schema";
import { ownerRef, ownerToDto } from "../owners/schema";
import { Owner, Review } from "@prisma/client";

export const reviewSchema = Type.Object(
  {
    id: Type.Integer(),
    content: Type.String({ minLength: 1, maxLength: 1023 }),
    rating: Type.Integer({ minimum: 1, maximum: 10 }),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),
    menu: menuRef,
    author: ownerRef,
  },
  { $id: "Review" }
);

export const createReviewSchema = Type.Object({
  content: reviewSchema.properties.content,
  rating: reviewSchema.properties.rating,
  menu: menuSchema.properties.id,
});

export const updateReviewSchema = AtLeastOneProp(
  Type.Object({
    content: reviewSchema.properties.content,
    rating: reviewSchema.properties.rating,
  })
);

export const searchReviewSchema = Type.Intersect([
  paginationRequest,
  Type.Object({
    menu: menuSchema.properties.id,
  }),
]);

export const reviewRef = Type.Ref(reviewSchema);

export type ReviewDto = Static<typeof reviewSchema>;
export type CreateReviewInput = Static<typeof createReviewSchema>;
export type UpdateReviewInput = Static<typeof updateReviewSchema>;
export type SearchReviewInput = Static<typeof searchReviewSchema>;
export type ReviewWithMenuAuthor = Review & {
  menu: MenuWithOwner;
  author: Owner;
};

export const reviewToDto = (review: ReviewWithMenuAuthor): ReviewDto => ({
  id: review.id,
  content: review.content,
  rating: review.rating,
  created_at: review.created_at.toISOString(),
  updated_at: review.updated_at.toISOString(),
  menu: menuToDto(review.menu),
  author: ownerToDto(review.author),
});
