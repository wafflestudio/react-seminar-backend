import { Owner } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { AtLeastOneProp, Nullable } from "../lib/schema";

export const passwordSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});
export const ownerSchema = Type.Object(
  {
    id: Type.Integer(),
    username: Type.String({
      minLength: 1,
      maxLength: 31,
      pattern: /^[\w-]+$/.source,
      examples: ["joongwon"],
    }),
    store_name: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 31,
        examples: ["와플스튜디오 중원점"],
      })
    ),
    store_description: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 255,
        examples: ["맛있는 와플을 만든다"],
      })
    ),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),
  },
  { $id: "Owner" }
);
export const ownerRef = Type.Ref(ownerSchema);

export const ownerWithRatingSchema = Type.Intersect(
  [
    ownerSchema,
    Type.Object({
      rating: Nullable(
        Type.Number({
          description: "가게의 평균 별점",
          minimum: 1,
          maximum: 10,
        })
      ),
    }),
  ],
  { $id: "OwnerWithRating" }
);

export const ownerWithRatingRef = Type.Ref(ownerWithRatingSchema);
export type OwnerDtoWithRating = Static<typeof ownerWithRatingSchema>;

export type OwnerDto = Static<typeof ownerSchema>;

export function ownerWithRatingToDto(
  owner: OwnerWithRating
): OwnerDtoWithRating {
  const [oSum, oCnt] = owner.menus.reduce(
    ([mSum, mCnt], menu) => [
      mSum + menu.reviews.reduce((rSum, review) => rSum + review.rating, 0),
      mCnt + menu.reviews.length,
    ],
    [0, 0]
  );
  const rating = oCnt === 0 ? null : oSum / oCnt;
  return {
    id: owner.id,
    username: owner.username,
    store_name: owner.store_name ?? undefined,
    store_description: owner.store_description ?? undefined,
    created_at: owner.created_at.toISOString(),
    updated_at: owner.updated_at.toISOString(),
    rating,
  };
}

export const ownerToDto = (owner: Owner): OwnerDto => ({
  id: owner.id,
  username: owner.username,
  store_name: owner.store_name ?? undefined,
  store_description: owner.store_description ?? undefined,
  created_at: owner.created_at.toISOString(),
  updated_at: owner.updated_at.toISOString(),
});

export const updateOwnerSchema = AtLeastOneProp(
  Type.Object({
    store_name: Nullable(ownerSchema.properties.store_name),
    store_description: Nullable(ownerSchema.properties.store_description),
  })
);

export const createOwnerSchema = Type.Object({
  username: ownerSchema.properties.username,
  password: passwordSchema,
  store_name: Type.Optional(ownerSchema.properties.store_name),
  store_description: Type.Optional(ownerSchema.properties.store_description),
});

export const listOwnerSchema = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
      description: "검색할 가게의 이름. store_name 또는 username을 검색합니다",
    })
  ),
});

export type UpdateOwnerInput = Static<typeof updateOwnerSchema>;

export type CreateOwnerInput = Static<typeof createOwnerSchema>;

export type ListOwnerInput = Static<typeof listOwnerSchema>;

export type OwnerWithRating = Owner & {
  menus: {
    reviews: {
      rating: number;
    }[];
  }[];
};
