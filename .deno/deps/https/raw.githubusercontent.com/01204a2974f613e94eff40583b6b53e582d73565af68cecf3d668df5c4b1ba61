export const ifElse = <A, B, C, D>(
  predicate: (a: A | C) => true | false,
  whenTrue: (a: A) => B,
  whenFalse: (c: C) => D,
) => (x: A | C): B | D => (predicate(x) ? whenTrue(x as A) : whenFalse(x as C));
