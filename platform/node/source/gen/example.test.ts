import { describe } from "../lib/describe";
import { example } from "./example";

describe("typeof example", ({ assert }) => {
  assert({
    actual: typeof example,
    expected: "function",
    value: example,
    should: "be a function",
  });
});

describe("function invocation", ({ assert }) => {
  assert({
    actual: example(),
    given: "Invocation of example()",
    expected: "It works!",
  });
});
