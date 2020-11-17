/**
 * ```
 * invoker = k => (...as) => (c: { k: (...as) => b }) => b
 * ```
 * -----------------------------------------------------------------------------
 *
 * Takes a method name, __ab__, one or more arguments, __as__, and an
 * object, __c__, which has a method of name __ab__ that accepts __as__ and
 * returns __b__. It invokes the method, applying __as__ as it's arguments,
 * and returns the result, __b__; i.e.:
 *
 * ```
 * const k = "slice"
 * const as = [6]
 * const c = "abcdefghijklm"
 *
 * invoker(k)(...as)(c) <=> c[k](...as) <=> "ghijklm"
 * ```
 */
export const invoker = <K extends PropertyKey>(k: K) =>
  <AS extends unknown[]>(...as: AS) =>
    <B>(c: { [_ in K]: (...as: AS) => B }): B => c[k](...as);
