// deno-lint-ignore-file ban-types

import { curryN } from "./curryN.ts";
/**
 * ```
 * curry :: ((a¹, a²..., aⁿ) => b) => a¹ => a²... => aⁿ => b
 * ```
 * -----------------------------------------------------------------------------
 * Converts a _Variadic_ function into a series of _Unary_ functions that
 * produce the same final value.
 *
 * @todo add support for Variadic Tuples in TypeScript 4
 *
 */
export const curry = <F extends Function>(f: F) => curryN(f.length)(f);
