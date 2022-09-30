import { Type } from "@sinclair/typebox";

export const ownerSchema = Type.Object({
  id: Type.Number(),
  username: Type.String(),
  store_name: Type.Optional(Type.String()),
  store_description: Type.Optional(Type.String()),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
});
