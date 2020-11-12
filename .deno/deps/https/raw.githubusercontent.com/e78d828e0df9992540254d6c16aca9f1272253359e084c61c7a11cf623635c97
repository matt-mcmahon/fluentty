// deno-lint-ignore-file ban-types

import { isArray } from "./isArray.ts";
import { isDate } from "./isDate.ts";
import { isObject } from "./isObject.ts";
import { isDefined } from "./isDefined.ts";

function cloneObject<A extends object>(a: A, map: WeakMap<object, unknown>): A {
  if (map.has(a)) {
    return map.get(a) as A;
  } else {
    const clone: Partial<A> = {};
    map.set(a, clone);
    Object.entries(a).reduce((clone, [key, value]) => {
      return Object.assign(clone, { [key]: cloneUnknown(value, map) });
    }, clone);
    return clone as A;
  }
}

function cloneDate(a: Date): Date {
  return new Date(a.valueOf());
}

function cloneArray<A extends unknown[]>(
  a: A,
  map: WeakMap<object, unknown>,
): A {
  if (map.has(a)) {
    return map.get(a) as A;
  } else {
    const clone: unknown[] = [];
    map.set(a, clone);
    return a.reduce((clone: unknown[], v: unknown) => {
      clone.push(cloneUnknown(v, map));
      return clone;
    }, clone) as A;
  }
}

function cloneUnknown<A>(a: A, map: WeakMap<object, unknown>): A {
  const t = isDefined(a)
    ? isDate(a)
      ? cloneDate(a)
      : isArray(a)
      ? cloneArray(a, map)
      : isObject(a)
      ? cloneObject(a, map)
      : a
    : a;
  return (t as unknown) as A;
}

/**
 * ```
 * clone :: a => a
 * ```
 * @export
 * @template A
 * @param {A} a
 * @returns {A}
 */
export function clone<A>(a: A): A {
  const map = new WeakMap();
  return cloneUnknown(a, map);
}
