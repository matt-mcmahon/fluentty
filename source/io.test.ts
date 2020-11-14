import { describe } from "../remote/describe.ts";
import { IO } from "./io.ts";

describe(`IO`, async ({ assert }) => {
  class Process<T> {
    #value: T;
    constructor(t: T) {
      this.#value = t;
    }
    async IO(): Promise<T> {
      return this.#value;
    }
  }

  {
    const actual = await IO(
      new Process("one"),
      new Process("two"),
      new Process("three"),
    );
    const expected = [
      "one",
      "two",
      "three",
    ];
    assert({ actual, expected });
  }
});
