export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript/39419171#39419171
// https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript/58009992#58009992
export function assertUnreachable(obj: never): never {
  console.error("assertUnreachable received object:");
  console.error(obj);
  throw new Error("This is a bug. Please report.");
}
