export * from "https://deno.land/std@0.76.0/testing/asserts.ts";

export interface AssertFunction {
  (actual: unknown, expected: unknown, msg?: string | undefined): void;
}
