import { clone } from "./clone.ts";

/**
 * ```
 * assoc = k => b => a => {...a, k:b}
 * ```
 * -----------------------------------------------------------------------------
 *
 * Clones the object __a__, associating the key, __k__, with value, __b__.
 *
 * For example:
 *
 * ```
 * a[k] = b <=> assoc(k)(b)(a).
 * ```
 *
 */
export const assoc = <K extends PropertyKey>(k: K) =>
  <B>(b: B) => <A>(a: A): A | { K: B } => Object.assign(clone(a), { [k]: b });
