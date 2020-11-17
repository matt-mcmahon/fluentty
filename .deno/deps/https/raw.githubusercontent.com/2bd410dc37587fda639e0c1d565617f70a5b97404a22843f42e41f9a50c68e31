import { isDefined } from "./isDefined.ts";
import { isNaN } from "./isNaN.ts";

/**
 * ```
 * defaultTo :: a => b => a|b
 * ```
 * -----------------------------------------------------------------------------
 *
 * If __b__ is `null`, `undefined`, or `NaN`, return __a__, otherwise return __b__.
 *
 */
export const defaultTo = <A>(a: A) =>
  <B>(b: B): A | B => isNaN(b) ? a : isDefined(b) ? b : a;
