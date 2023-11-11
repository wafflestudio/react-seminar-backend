import { Owner } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";

export const passwordSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});
export const ownerSchema = Type.Object(
  {
    id: Type.Integer(),
    username: Type.String({
      minLength: 1,
      maxLength: 31,
      pattern: /^[\w-]+$/.source,
      examples: ["joongwon"],
    }),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),
  },
  { $id: "User" }
);
export const ownerRef = Type.Ref(ownerSchema);

export type OwnerDto = Static<typeof ownerSchema>;

export const ownerToDto = (owner: Owner): OwnerDto => ({
  id: owner.id,
  username: owner.username,
  created_at: owner.created_at.toISOString(),
  updated_at: owner.updated_at.toISOString(),
});

export const createOwnerSchema = Type.Object({
  username: ownerSchema.properties.username,
  password: passwordSchema,
});

export type CreateOwnerInput = Static<typeof createOwnerSchema>;

export type OwnerWithRating = Owner & {
  menus: {
    reviews: {
      rating: number;
    }[];
  }[];
};
