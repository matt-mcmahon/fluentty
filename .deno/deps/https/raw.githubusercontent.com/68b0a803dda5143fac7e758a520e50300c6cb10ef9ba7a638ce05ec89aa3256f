/**
 * ```
 * complement :: (a => Boolean) => a => Boolean
 * ```
 * -----------------------------------------------------------------------------
 *
 * Creates a function that will return the _complement_ of applying a _value_
 * to the given _predicate_. For example:
 *
 * ```
 * const isFunction = f => typeof f === 'function
 * const isNotFunction = complement(f)
 *
 * isFunction('value') => false
 * isNotFunction('value') => true
 * ```
 */
export const complement = <A>(predicate: (a: A) => boolean) =>
  (a: A): boolean => !predicate(a);
