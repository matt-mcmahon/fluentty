import { stripColor } from "../remote/colors.ts";

export const tap = <A>(fn: (a: A) => void) =>
  (a: A): A => {
    fn(a);
    return a;
  };

export type JSONData = ReturnType<typeof JSON.parse>;

export async function readFile(filePath: string) {
  return Deno.readTextFile(filePath);
}

export async function stringifyJSON(data: JSONData) {
  return JSON.stringify(data, null, "\t");
}

export async function parseJSON(data: JSONData) {
  return JSON.parse(data);
}

export function strip(string: string) {
  return stripColor(string).trim();
}
