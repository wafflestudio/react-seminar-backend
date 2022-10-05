import { Owner } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { Nullable } from "../lib/utils";

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

export const updateOwnerSchema = Type.Object({
  store_name: Type.Optional(Nullable(ownerSchema.properties.store_name)),
  store_description: Type.Optional(
    Nullable(ownerSchema.properties.store_description)
  ),
});

export const createOwnerSchema = Type.Object({
  username: ownerSchema.properties.username,
  password: passwordSchema,
  store_name: Type.Optional(ownerSchema.properties.store_name),
  store_description: Type.Optional(ownerSchema.properties.store_description),
});

export const somthingToUpdateOwner = (input: UpdateOwnerInput) =>
  input.store_description !== undefined || input.store_name != undefined;

export type UpdateOwnerInput = Static<typeof updateOwnerSchema>;

export type CreateOwnerInput = Static<typeof createOwnerSchema>;
