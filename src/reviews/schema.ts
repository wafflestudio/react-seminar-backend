import { Type } from "@sinclair/typebox";
import { menuRef } from "../menus/schema";
import { ownerRef } from "../owners/schema";

const reviewSchema = Type.Object(
  {
    id: Type.Integer(),
    content: Type.String({ minLength: 1, maxLength: 1023 }),
    rating: Type.Integer({ minimum: 1, maximum: 10 }),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),
    menu: menuRef,
    author: ownerRef,
  },
  { $id: "Review" }
);
