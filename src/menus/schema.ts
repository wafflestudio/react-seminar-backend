import { Static, Type } from "@sinclair/typebox";
import { Nullable } from "../lib/utils";
import { ownerSchema } from "../owners/schema";

const menuSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String({ minLength: 1, maxLength: 31 }),
  type: Type.Enum({
    waffle: "waffle",
    beverage: "beverage",
    coffee: "coffee",
    desert: "desert",
  } as const),
  price: Type.Integer(),
  image: Nullable(
    Type.String({ minLength: 1, maxLength: 1023, format: "uri" })
  ),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 1023 })),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
  owner: ownerSchema,
});
const searchOptionSchema = Type.Partial(
  Type.Object({
    from: Type.Number(),
    count: Type.Integer({ minimum: 1, maximum: 50, default: 20 }),
    owner: Type.Integer({ description: "가게 주인장 id" }),
    search: Type.String({
      description: "메뉴 이름",
      minLength: 1,
      maxLength: 31,
    }),
    type: menuSchema.properties.type,
  })
);
export type SearchOption = Static<typeof searchOptionSchema>;
export type MenuDto = Static<typeof menuSchema>;
