/**
 * ```
 * has :: k => a => boolean
 * ```
 * -----------------------------------------------------------------------------
 *
 * Creates a _Predicate_ that returns `true` if it's argument has an owned
 * property, __k__, otherwise returns `false`. Unlike the `in` operator, `has`
 * will not check the prototype chain. For example:
 *
 * ```
 * 'toString' in {}     //=> true
 * has('toString', {})  //=> false
 * ```
 *
 * @param k the name or symbol of the property to check for
 * @param a the object to check for ownership of the property
 */
export const has = <K extends PropertyKey>(k: K) =>
  (a: unknown): a is { [P in K]: unknown } =>
    Object.prototype.hasOwnProperty.call(a, k);
