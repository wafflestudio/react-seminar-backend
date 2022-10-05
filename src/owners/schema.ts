import { Owner } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";

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
  store_name: Type.Optional(Type.String({ minLength: 1, maxLength: 31 })),
  store_description: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 255,
    })
  ),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
});
export type OwnerDto = Static<typeof ownerSchema>;
export const ownerToDto = (owner: Owner): OwnerDto => ({
  id: owner.id,
  username: owner.username,
  store_name: owner.store_name ?? undefined,
  store_description: owner.store_description ?? undefined,
  created_at: owner.created_at.toISOString(),
  updated_at: owner.updated_at?.toISOString() ?? undefined,
});
