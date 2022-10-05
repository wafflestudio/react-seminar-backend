import { Static, TSchema, Type } from "@sinclair/typebox";

export async function nullify<T>(task: () => Promise<T>): Promise<T | null> {
  try {
    return await task();
  } catch {
    return null;
  }
}

export const selectOne = <T>(arr: T[]): T | null =>
  arr.length === 1 ? arr[0] : null;

export type NullableProps<T> = {
  [P in keyof T]: T[P] | null;
};

export type NullableToUndefined<T> = {
  [P in keyof T]: T[P] extends null ? NonNullable<T[P]> | undefined : T[P];
};

export function typeChecked<T>(x: T): T {
  return x;
}

export const STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  ACCESS_DENIED: 403,
  NOT_FOUND: 404,
} as const;

export function Nullable<T extends TSchema>(type: T) {
  type S = Static<T>;
  return Type.Unsafe<S | null>({ ...type, nullable: true });
}
