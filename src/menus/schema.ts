import { Static, Type } from "@sinclair/typebox";
import { ownerSchema, ownerToDto } from "../owners/schema";
import { Menu, Owner } from "@prisma/client";

const menuSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String({ minLength: 1, maxLength: 31 }),
  type: Type.Enum({
    waffle: "waffle",
    beverage: "beverage",
    coffee: "coffee",
    desert: "desert",
  } as const),
  price: Type.Integer({ minimum: 10, maximum: 1000000, multipleOf: 10 }),
  image: Type.Optional(
    Type.String({ minLength: 1, maxLength: 1023, format: "uri" })
  ),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 1023 })),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
  owner: ownerSchema,
});
const searchMenuOptionSchema = Type.Partial(
  Type.Object({
    from: Type.Number(),
    count: Type.Integer({
      minimum: 1,
      maximum: 50,
      default: 20,
      description: "다 긁어오려면 count를 넣지마시오",
    }),
    owner: Type.Integer({ description: "가게 주인장 id" }),
    search: Type.String({
      description: "메뉴 이름",
      minLength: 1,
      maxLength: 31,
    }),
    type: menuSchema.properties.type,
  })
);
const createMenuSchema = Type.Object({
  name: menuSchema.properties.name,
  type: menuSchema.properties.type,
  price: menuSchema.properties.price,
  image: menuSchema.properties.image,
  description: menuSchema.properties.description,
});
export type SearchMenuOption = Static<typeof searchMenuOptionSchema>;
export type MenuDto = Static<typeof menuSchema>;
export type CreateMenuInput = Static<typeof createMenuSchema>;

export const menuToDto = (menu: MenuWithOwner): MenuDto => ({
  id: menu.id,
  owner: ownerToDto(menu.owner),
  type: menu.type,
  name: menu.name,
  created_at: menu.created_at.toISOString(),
  description: menu.description ?? undefined,
  image: menu.image ?? undefined,
  price: menu.price,
  updated_at: menu.updated_at?.toISOString(),
});
export type MenuWithOwner = Menu & { owner: Owner };
