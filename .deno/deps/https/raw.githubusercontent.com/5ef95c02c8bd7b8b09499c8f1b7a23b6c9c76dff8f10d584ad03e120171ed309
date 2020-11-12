/**
 * ```
 * bind :: (...as => b) => o => ...as => b
 * ```
 * -----------------------------------------------------------------------------
 * Creates a new _Function_ that binds a __method__ to a __context__.
 *
 * @param m - a function that depends on a dynamic `this` context
 * @param o - the method's context
 */
export const bind = <M extends CallableFunction>(m: M) =>
  (b: ThisParameterType<M>): OmitThisParameter<M> => m.bind(b);
