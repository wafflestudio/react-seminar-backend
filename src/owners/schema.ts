import { Type } from "@sinclair/typebox";

export const passwordSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});

export const ownerSchema = Type.Object({
  id: Type.Integer(),
  username: Type.String({
    minLength: 1,
    maxLength: 31,
    pattern: /^[\w-]+$/.source,
  }),
  store_name: Type.Union([
    Type.String({ minLength: 1, maxLength: 31 }),
    Type.Null(),
  ]),
  store_description: Type.Union([
    Type.String({ minLength: 1, maxLength: 255 }),
    Type.Null(),
  ]),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
});
