export * from "https://deno.land/std@0.77.0/testing/asserts.ts";

export interface AssertFunction {
  (actual: unknown, expected: unknown, msg?: string | undefined): void;
}
