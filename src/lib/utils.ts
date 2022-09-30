export async function nullify<T>(task: () => Promise<T>): Promise<T | null> {
  try {
    return await task();
  } catch {
    return null;
  }
}

export const selectOne = <T>(arr: T[]): T | null =>
  arr.length === 1 ? arr[0] : null;
