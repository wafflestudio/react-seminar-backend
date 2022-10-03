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

export function never(_x: never): never {
  throw new Error("unreachable code");
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
