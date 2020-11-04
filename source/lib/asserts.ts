export * from "../../remote/asserts.ts";

export interface AssertFunction {
  (actual: unknown, expected: unknown, msg?: string | undefined): void;
}
