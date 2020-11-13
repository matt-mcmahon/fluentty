// deno-lint-ignore-file ban-types

const gather = <F extends Function>(
  n: number,
  f: F,
  previous: unknown[] = [],
) => {
  const curried = (...as: unknown[]) => {
    const args = [...previous, ...as];
    const remaining = n - args.length;
    return remaining > 0 ? gather(n, f, args) : f(...args.slice(0, n));
  };
  Object.defineProperties(curried, {
    length: { value: n - previous.length },
    name: { value: `${f.name}${previous.length}` },
  });
  return curried;
};

/**
 * ```
 * curryN :: n => ((a¹, a², ..., aⁿ) => b) =>  a¹ => a²... => aⁿ => b
 * ```
 * -----------------------------------------------------------------------------
 * Converts a function that accepts an arity, __n__, number of arguments into a
 * series of _Unary_ functions that produce the same final value.
 *
 * @todo add support for Variadic Tuples in TypeScript 4
 */
export const curryN = (n: number) =>
  <F extends Function>(f: F): Function => gather(n, f);
