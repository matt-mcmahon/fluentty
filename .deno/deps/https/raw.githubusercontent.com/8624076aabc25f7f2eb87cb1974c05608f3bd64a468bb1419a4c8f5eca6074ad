/**
 * ```
 * isDefined :: a => boolean
 * ```
 * -----------------------------------------------------------------------------
 *
 * Returns `false` if a is `undefined` or `null`, otherwise return `true`.
 *
 */
export const isDefined = <A>(
  a: A,
): a is Exclude<A, null> & Exclude<A, undefined> => a != null;
