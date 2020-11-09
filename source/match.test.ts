import { assertEquals, assertThrows } from "../remote/asserts.ts";
import { Match } from "./match.ts";
import { Prompt } from "./prompt.ts";
import { Question } from "./question.ts";

function makePass(q: Question) {
  return (expected: string, input: string) => {
    const actual = q.test(input);
    const message = `given input: ${Deno.inspect(input)}; ` +
      `should ${Deno.inspect(expected)}`;
    assertEquals(actual, expected, message);
  };
}

function makeFail(q: Question) {
  return (_: unknown, input: string) => {
    assertThrows(() => q.test(input));
  };
}

Deno.test("Match->matchCase().matchFull()", () => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.matchCase().matchFull();

  const p = makePass(q1);
  const f = makeFail(q1);

  p("one", "one");
  f("one", "on");
  f("one", "o");
  f("one", "ne");
  f("one", "n");
  f("one", "e");

  p("two", "two");
  f("two", "tw");
  f("two", "t");
  f("two", "wo");
  f("two", "w");
  f("one", "o");

  p("three", "three");
  f("three", "thre");
  f("three", "thr");
  f("three", "th");
  f("three", "t");
  f("three", "hree");
  f("three", "hre");
  f("three", "hr");
  f("three", "h");

  f("one", "One");
  f("two", "tWo");
  f("three", "tHree");
});

Deno.test("Match->matchCase().matchInitial()", () => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.matchCase().matchInitial();

  const p = makePass(q1);
  const f = makeFail(q1);

  p("one", "one");
  p("one", "on");
  p("one", "o");
  f("one", "ne");
  f("one", "n");
  f("one", "e");

  p("two", "two");
  p("two", "tw");
  f("two", "t");
  f("two", "wo");
  f("two", "w");
  p("one", "o");

  p("three", "three");
  p("three", "thre");
  p("three", "thr");
  p("three", "th");
  f("three", "t");
  f("three", "hree");
  f("three", "hre");
  f("three", "hr");
  f("three", "h");

  f("one", "One");
  f("one", "On");
  f("one", "O");
  f("two", "Two");
  f("two", "Tw");
  f("one", "O");
  f("three", "Three");
  f("three", "Thre");
  f("three", "Thr");
  f("three", "Th");
});

Deno.test("Match->matchCase().matchAnywhere()", () => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.matchCase().matchAnywhere();

  const p = makePass(q1);
  const f = makeFail(q1);

  p("one", "one");
  p("one", "on");
  f("one", "o");
  p("one", "ne");
  p("one", "n");
  f("one", "e");

  p("two", "two");
  p("two", "tw");
  f("two", "t");
  p("two", "wo");
  p("two", "w");

  p("three", "three");
  p("three", "thre");
  p("three", "thr");
  p("three", "th");
  p("three", "hree");
  p("three", "hre");
  p("three", "hr");
  p("three", "h");

  f("one", "One");
  f("one", "On");
  f("one", "Ne");
  f("one", "N");
  f("two", "Two");
  f("two", "Tw");
  f("two", "Wo");
  f("two", "W");
  f("three", "Three");
  f("three", "Thre");
  f("three", "Thr");
  f("three", "Th");
  f("three", "Hree");
  f("three", "Hre");
  f("three", "Hr");
  f("three", "H");
});

Deno.test("Match->ignoreCase().matchFull()", () => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.ignoreCase().matchFull();

  const p = makePass(q1);
  const f = makeFail(q1);

  p("one", "one");
  f("one", "on");
  f("one", "o");
  f("one", "ne");
  f("one", "n");
  f("one", "e");

  p("two", "two");
  f("two", "tw");
  f("two", "t");
  f("two", "wo");
  f("two", "w");
  f("one", "o");

  p("three", "three");
  f("three", "thre");
  f("three", "thr");
  f("three", "th");
  f("three", "t");
  f("three", "hree");
  f("three", "hre");
  f("three", "hr");
  f("three", "h");

  p("one", "One");
  p("two", "tWo");
  p("three", "tHree");
});

Deno.test("Match->ignoreCase().matchInitial()", () => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.ignoreCase().matchInitial();

  const p = makePass(q1);
  const f = makeFail(q1);

  p("one", "one");
  p("one", "on");
  p("one", "o");
  f("one", "ne");
  f("one", "n");
  f("one", "e");

  p("two", "two");
  p("two", "tw");
  f("two", "t");
  f("two", "wo");
  f("two", "w");
  p("one", "o");

  p("three", "three");
  p("three", "thre");
  p("three", "thr");
  p("three", "th");
  f("three", "t");
  f("three", "hree");
  f("three", "hre");
  f("three", "hr");
  f("three", "h");

  p("one", "One");
  p("one", "On");
  p("one", "O");
  p("two", "Two");
  p("two", "Tw");
  p("one", "O");
  p("three", "Three");
  p("three", "Thre");
  p("three", "Thr");
  p("three", "Th");
});

Deno.test("Match->ignoreCase().matchAnywhere()", () => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.ignoreCase().matchAnywhere();

  const p = makePass(q1);
  const f = makeFail(q1);

  p("one", "one");
  p("one", "on");
  f("one", "o");
  p("one", "ne");
  p("one", "n");
  f("one", "e");

  p("two", "two");
  p("two", "tw");
  f("two", "t");
  p("two", "wo");
  p("two", "w");

  p("three", "three");
  p("three", "thre");
  p("three", "thr");
  p("three", "th");
  p("three", "hree");
  p("three", "hre");
  p("three", "hr");
  p("three", "h");

  p("one", "One");
  p("one", "On");
  p("one", "Ne");
  p("one", "N");
  p("two", "Two");
  p("two", "Tw");
  p("two", "Wo");
  p("two", "W");
  p("three", "Three");
  p("three", "Thre");
  p("three", "Thr");
  p("three", "Th");
  p("three", "Hree");
  p("three", "Hre");
  p("three", "Hr");
  p("three", "H");
});
