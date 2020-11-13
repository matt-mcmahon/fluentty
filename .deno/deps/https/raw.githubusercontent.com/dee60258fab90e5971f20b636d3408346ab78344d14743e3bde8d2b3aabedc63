/**
 * ```
 * reduceRight :: ((a, b) => a) => a => [bⁿ, ..., b², b¹, b⁰] => a
 * ```
 * -----------------------------------------------------------------------------
 *
 * __reduceRight__ is a _Unary_ _Combinator_, that reduces an _Array_, in
 * last-to-first order, to a single value. It does this by passing an initial
 * value, the _accumulator_ and the last value of the _Array_, to _reducer_
 * function. The return value for that call is used as the accumulator for the
 * next iteration.
 *
 */
export const reduceRight = <A, B>(reducer: (a: A, b: B) => A) =>
  (a: A) => (bs: B[]): A => (bs.length > 0 ? bs.reduceRight(reducer, a) : a);
