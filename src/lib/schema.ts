import { Static, TObject, TSchema, Type } from "@sinclair/typebox";

export function Nullable<T extends TSchema>(type: T) {
  type S = Static<T>;
  return Type.Unsafe<S | null>({ ...type, nullable: true });
}

export function AtLeastOneProp<T extends TObject>(type: T) {
  type S = Static<T>;
  const { required, description, ...rest } = type;
  return Type.Unsafe<Partial<S>>({
    ...rest,
    description:
      (description ? description + "; " : "") +
      "props 중 적어도 하나는 들어있어야 함",
    anyOf: Object.keys(type.properties).map((k) => ({
      required: [k],
    })),
  });
}

export const paginationRequest = Type.Partial(
  Type.Object({
    from: Type.Integer({ description: "next로 들어오는 값을 넣으시오" }),
    count: Type.Integer({
      minimum: 1,
      maximum: 50,
      description: "다 긁어오려면 count를 넣지마시오",
    }),
  })
);

export function PaginationResponse<T extends TSchema>(data: T) {
  return Type.Object({
    data: Type.Array(data),
    next: Type.Integer({
      description: "이 값을 from에 넣으면 다음 페이지를 불러온다",
    }),
  });
}
