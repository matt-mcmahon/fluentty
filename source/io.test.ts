import { assertEquals } from "../remote/asserts.ts";
import { IO } from "./io.ts";

Deno.test(`IO`, async () => {
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
    assertEquals(actual, expected);
  }
});
