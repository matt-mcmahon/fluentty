// deno-lint-ignore-file no-explicit-any

/**
 * ```
 * blackbird :: ((b¹, b², ..., bⁿ) => c) => (a => b¹, a => b², ..., a => bⁿ) => a => c
 * ```
 * -----------------------------------------------------------------------------
 * The __blackbird__ _Combinator_ takes a __converging__ _function_ that
 * accepts _n_ arguments, _n_ _Unary_ function __parts__, and a __value__. It
 * applies the value to each part, and computes a final result by applying
 * the returned values as arguments to the __converging__ function. For example:
 *
 * ```
 * const sum = (...ns) => ns.reduce((a, b) => a + b, 0)
 * const increment = a => a + 1
 * const square = a => a * a
 *
 * blackbird(sum)(increment, square)(3)
 * //> sum(increment(3), square(3))
 * //> sum(3 + 1, 3 * 4)
 * //> sum(4, 9)
 * //> 0 + 4 + 9
 * //> 13
 * ```
 *
 * @todo add support for Variadic Tuples in TypeScript 4
 * @todo remove file allow-any pragma
 */
export const blackbird = <BS extends any[], C>(converging: (...bs: BS) => C) =>
  <A>(...parts: ((a: A) => unknown)[]) =>
    (a: A): C => {
      const bs = parts.map((part: (a: any) => any) => part(a)) as BS;
      return converging(...bs);
    };
