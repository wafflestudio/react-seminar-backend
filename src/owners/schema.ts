import { Type } from "@sinclair/typebox";

export const usernameSchema = Type.String({
  minLength: 1,
  maxLength: 31,
  pattern: /^[\w-]+$/.source,
});

export const passwordSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});

export const ownerSchema = Type.Object({
  id: Type.Integer(),
  username: usernameSchema,
  store_name: Type.Optional(Type.String()),
  store_description: Type.Optional(Type.String()),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
});
