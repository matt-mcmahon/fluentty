export type Inspect = {
  (literals: TemplateStringsArray, ...values: unknown[]): string;
};

/**
 * ```
 * configure :: o => TemplateTag
 * ```
 * -----------------------------------------------------------------------------
 *
 * Deno.inspect that works as a tagged template function.
 * ```js
 * const foo = { msg: "Foo!" };
 * inspect`foo: ${foo}`; //=> 
 * ```
 */
export const inspect = (
  literals: TemplateStringsArray,
  ...values: unknown[]
) => {
  const inspectedValues = values.map((o: unknown) => Deno.inspect(o));
  const full = [];
  for (let i = 0; i < literals.length; i++) {
    if (literals[i]) {
      full.push(literals[i]);
    }
    if (inspectedValues[i]) {
      full.push(inspectedValues[i]);
    }
  }
  return full.join("");
};
