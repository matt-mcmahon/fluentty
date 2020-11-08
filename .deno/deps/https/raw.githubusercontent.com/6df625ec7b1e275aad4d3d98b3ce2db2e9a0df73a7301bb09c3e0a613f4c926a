export { assertEquals, assertNotEquals } from "./remote/asserts.ts";

type TestImplementation = {
  (): void | Promise<void>;
};

export const test = (label: string, implementation: TestImplementation) =>
  Deno.test(label, implementation);
