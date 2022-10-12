import { Static, Type } from "@sinclair/typebox";
import { AtLeastOneProp, Nullable, paginationRequest } from "../lib/schema";
import { ownerRef, ownerToDto } from "../owners/schema";
import { Menu, Owner } from "@prisma/client";

export const menuSchema = Type.Object(
  {
    id: Type.Integer(),
    name: Type.String({
      minLength: 1,
      maxLength: 31,
      examples: ["딸기생크림와플"],
    }),
    type: Type.Enum({
      waffle: "waffle",
      beverage: "beverage",
      coffee: "coffee",
      dessert: "dessert",
    } as const),
    price: Type.Integer({
      minimum: 10,
      maximum: 1000000,
      multipleOf: 10,
      examples: [5000],
    }),
    image: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 1023,
        format: "uri",
        examples: ["https://example.com/foo.png"],
      })
    ),
    description: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 1023,
        examples: ["맛있는 전설이 깃든 와플"],
      })
    ),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),
    owner: ownerRef,
  },
  { $id: "Menu" }
);
export const menuRef = Type.Ref(menuSchema);
export const searchMenuOptionSchema = Type.Intersect([
  paginationRequest,
  Type.Partial(
    Type.Object({
      owner: Type.Integer({ description: "가게 주인장 id" }),
      search: Type.String({
        description: "메뉴 이름",
        minLength: 1,
        maxLength: 31,
      }),
      type: menuSchema.properties.type,
    })
  ),
]);

export const createMenuSchema = Type.Object({
  name: menuSchema.properties.name,
  type: menuSchema.properties.type,
  price: menuSchema.properties.price,
  image: menuSchema.properties.image,
  description: menuSchema.properties.description,
});

export const editMenuSchema = AtLeastOneProp(
  Type.Object({
    price: menuSchema.properties.price,
    image: Nullable(menuSchema.properties.image),
    description: Nullable(menuSchema.properties.description),
  })
);

export type SearchMenuOption = Static<typeof searchMenuOptionSchema>;
export type MenuDto = Static<typeof menuSchema>;
export type CreateMenuInput = Static<typeof createMenuSchema>;
export type EditMenuInput = Static<typeof editMenuSchema>;

export const menuToDto = (menu: MenuWithOwner): MenuDto => ({
  id: menu.id,
  owner: ownerToDto(menu.owner),
  type: menu.type,
  name: menu.name,
  created_at: menu.created_at.toISOString(),
  description: menu.description ?? undefined,
  image: menu.image ?? undefined,
  price: menu.price,
  updated_at: menu.updated_at.toISOString(),
});
export type MenuWithOwner = Menu & { owner: Owner };
