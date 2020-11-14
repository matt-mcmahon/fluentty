import type { Assert, Inspect } from "../remote/describe.ts";
import { describe } from "../remote/describe.ts";
import { assertThrows } from "../remote/asserts.ts";
import { Match } from "./match.ts";
import { Prompt } from "./prompt.ts";
import { Question } from "./question.ts";

function makeTests(q: Question, assert: Assert, inspect: Inspect): [
  pass: (expected: string, input: string) => void,
  fail: (expected: string, input: string) => void,
] {
  const pass = (expected: string, input: string) => {
    const actual = q.test(input);
    const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;

    assert({ actual, expected, message });
  };

  const fail = (_: unknown, input: string) => {
    assertThrows(() => q.test(input));
  };

  return [pass, fail];
}

describe("Match->matchCase().matchFull()", ({ assert, inspect }) => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.matchCase().matchFull();

  const [p, f] = makeTests(q1, assert, inspect);

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

describe("Match->matchCase().matchInitial()", ({ assert, inspect }) => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.matchCase().matchInitial();

  const [p, f] = makeTests(q1, assert, inspect);

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

describe("Match->matchCase().matchAnywhere()", ({ assert, inspect }) => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.matchCase().matchAnywhere();

  const [p, f] = makeTests(q1, assert, inspect);

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

describe("Match->ignoreCase().matchFull()", ({ assert, inspect }) => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.ignoreCase().matchFull();

  const [p, f] = makeTests(q1, assert, inspect);

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

describe("Match->ignoreCase().matchInitial()", ({ assert, inspect }) => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.ignoreCase().matchInitial();

  const [p, f] = makeTests(q1, assert, inspect);

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

describe("Match->ignoreCase().matchAnywhere()", ({ assert, inspect }) => {
  const p1 = Prompt.from("match test 1");
  const m1 = new Match(p1, "one", "two", "three");
  const q1 = m1.ignoreCase().matchAnywhere();

  const [p, f] = makeTests(q1, assert, inspect);

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

describe("Match: something; given empty string", ({ assert, inspect }) => {
  const p1 = Prompt.from("Match->*().matchAnywhere(); empty string");
  const m1 = new Match(p1, "one");
  {
    const [, f] = makeTests(m1.ignoreCase().matchAnywhere(), assert, inspect);
    f("one", "");
  }
  {
    const [, f] = makeTests(m1.matchCase().matchAnywhere(), assert, inspect);
    f("one", "");
  }
});

describe("Match: empty string; given empty string", ({ assert, inspect }) => {
  const p1 = Prompt.from("Match->*().matchAnywhere(); empty string");
  const m1 = new Match(p1, "");
  {
    const [p] = makeTests(m1.ignoreCase().matchAnywhere(), assert, inspect);
    p("", "");
  }

  {
    const [p] = makeTests(m1.matchCase().matchAnywhere(), assert, inspect);
    p("", "");
  }
});
