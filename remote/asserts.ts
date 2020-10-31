export * from "https://deno.land/std@0.75.0/testing/asserts.ts";

export interface AssertFunction {
  (actual: unknown, expected: unknown, msg?: string | undefined): void;
}
