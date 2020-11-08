import { assertEquals, assertNotEquals, test } from "../lib/test-framework.ts";
import { Inspect, inspect } from "../lib/inspect.ts";
import { hasOwnOrDefault } from "./utils.ts";

export type Plan = {
  actual: unknown;
  expected?: unknown;
  given?: string;
  should?: string;
  value?: unknown;
  message?: string;
};

export interface Assert {
  (plan: Plan): void;
  not(plan: Plan): void;
}

export interface AssertFunction {
  (actual: unknown, expected: unknown, msg?: string): void;
}

export interface TestImplementation {
  ({ assert, inspect }: {
    assert: Assert;
    inspect: Inspect;
  }): Promise<void> | void;
}

export async function describe(
  prefix: string,
  implementation: TestImplementation,
): Promise<void> {
  const assert: Assert = Object.assign(makeAssert(assertEquals), {
    not: makeAssert(assertNotEquals),
  });
  return test(prefix, async () => implementation({ assert, inspect }));
}

export function makeAssert(assert: AssertFunction) {
  return async (plan: Plan | Promise<Plan>) => {
    const p = await plan;
    const expected = hasOwnOrDefault("expected")(true)(p);
    const {
      actual,
      given = inspect`${hasOwnOrDefault("value")(actual)(p)}`,
      should = inspect`be ${expected}`,
      message = `given ${given}; should ${should}`,
    } = p;
    return assert(actual, expected, message);
  };
}
