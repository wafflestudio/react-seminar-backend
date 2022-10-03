import { Static, TSchema, Type } from "@sinclair/typebox";

export function Nullable<T extends TSchema>(type: T) {
  type S = Static<T>;
  return Type.Unsafe<S | null>({ ...type, nullable: true });
}

export const passwordSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});

export const storeNameSchema = Type.String({ minLength: 1, maxLength: 31 });

export const storeDescriptionSchema = Type.String({
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
  store_name: Type.Optional(storeNameSchema),
  store_description: Type.Optional(storeDescriptionSchema),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.Optional(Type.String({ format: "date-time" })),
});
