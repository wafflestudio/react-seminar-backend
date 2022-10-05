import { Static, Type } from "@sinclair/typebox";
import { ownerRef, ownerToDto } from "../owners/schema";
import { Menu, Owner } from "@prisma/client";
import { AtLeastOneProp, Nullable } from "../lib/utils";

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
      desert: "desert",
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
    updated_at: Type.Optional(Type.String({ format: "date-time" })),
    owner: ownerRef,
  },
  { $id: "Menu" }
);
export const menuRef = Type.Ref(menuSchema);
export const searchMenuOptionSchema = Type.Partial(
  Type.Object({
    from: Type.Integer({ description: "next로 들어오는 값을 넣으시오" }),
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
export const paginationAnchor = Type.Integer({
  description: "이 값을 from에 넣으면 다음 페이지를 불러온다",
});
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
  updated_at: menu.updated_at?.toISOString(),
});
export type MenuWithOwner = Menu & { owner: Owner };
