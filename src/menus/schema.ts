import { Static, Type } from "@sinclair/typebox";
import {
  AtLeastOneProp,
  Nullable,
} from "../lib/schema";
import { ownerRef, ownerToDto } from "../owners/schema";
import { Menu, Owner } from "@prisma/client";

export const menuSchema = Type.Object(
  {
    id: Type.Integer(),
    name: Type.String({
      minLength: 1,
      maxLength: 20,
      examples: ["포카칩"],
    }),
    image:
      Type.String({
        minLength: 1,
        maxLength: 1023,
        format: "uri",
        examples: ["https://example.com/foo.png"],
      })
    ,
    rating: Nullable(Type.Number({ minimum: 1, maximum: 5 })),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),
    author: ownerRef,
  },
  { $id: "Snack" }
);
export const menuRef = Type.Ref(menuSchema);
export const searchMenuOptionSchema = 
  Type.Partial(
    Type.Object({
      // owner: Type.Integer({ description: "만든 사람 id" }),
      search: Type.String({
        description: "과자 이름",
        minLength: 1,
        maxLength: 31,
      }),
      /*
      rating: Type.Integer({
        minimum: 1,
        maximum: 5,
        description: "최소 별점",
      }),
      */
    })
  );

export const createMenuSchema = Type.Object({
  name: menuSchema.properties.name,
  image: menuSchema.properties.image,
});

export type SearchMenuOption = Static<typeof searchMenuOptionSchema>;
export type MenuDto = Static<typeof menuSchema>;
export type CreateMenuInput = Static<typeof createMenuSchema>;

export const menuToDto = (menu: MenuWithOwnerRating): MenuDto => {
  const rating = menu.reviews.length
    ? menu.reviews.reduce((sum, { rating }) => sum + rating, 0) /
      menu.reviews.length
    : null;
  return {
    id: menu.id,
    author: ownerToDto(menu.owner),
    name: menu.name,
    created_at: menu.created_at.toISOString(),
    image: menu.image,
    rating,
    updated_at: menu.updated_at.toISOString(),
  };
};
export type MenuWithOwnerRating = Menu & {
  owner: Owner;
  reviews: { rating: number }[];
};
