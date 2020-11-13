/**
 * ```
 * partial :: (a¹, …, aᵐ) => ((a¹, …, aⁿ, b¹, …, bⁿ) => c) => (b¹, …, bⁿ) => c
 * ```
 * -----------------------------------------------------------------------------
 *
 * Accepts _m_-number of arguments, **a**. Then accepts a function, **f**, of
 * the form `(a¹, …, aⁿ, b¹, …, bⁿ) => c`. Then accepts the remaining _n_-number
 * of arguments, __b__, and applies them to __f__, as in
 * `f(a¹, …, aⁿ, b¹, …, bⁿ) => c`.
 */
export const partial = <AS extends readonly unknown[]>(...as: AS) =>
  <BS extends readonly unknown[], C>(f: (...args: [...AS, ...BS]) => C) =>
    (...bs: BS) => f(...as, ...bs);
