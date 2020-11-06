import { exists } from "../remote/fs.ts";
import { askYesNo } from "./question.ts";
export { stripColor } from "../remote/colors.ts";

/**
 * Overwrites `filename` even if it exists, without prompting the user.
 */
export function forceWriteTextFile(filename: string, data: string) {
  return Deno.writeTextFile(filename, data);
}

/**
 * Takes an async function, `action`, then a string, `input`.
 * If input is "yes", runs the action.
 * Returns the string.
 */
export function ifYes(action: () => Promise<void>) {
  return async (input: string | boolean) => {
    if (input === "yes" || input === true) await action();
    return input;
  };
}

/**
 * Takes an async function, `action`, then a string, `input`.
 * If input is "no", runs the action.
 * Returns the string.
 */
export function ifNo(action: () => Promise<void>) {
  return async (input: string | boolean) => {
    if (input === "no" || input === false) await action();
    return input;
  };
}

/**
 * Print message to stdout
 */
export function stdout(message: string) {
  return Deno.stdout.write(new TextEncoder().encode(message));
}

/**
 * Accept input from stdin.
 */
export async function stdin(accept = 1024) {
  const max = 1024;
  const buf = new Uint8Array(accept > max ? accept : max);
  const got = <number> await Deno.stdin.read(buf);
  return new TextDecoder()
    .decode(buf.subarray(0, accept < got ? accept : got))
    .trim();
}

/**
 * Ignores any input and returns Promise<void>
 */
export async function done() {}

/**
 * If the `filename` exists, prompts the user before overwriting.
 */
export function verifyWriteTextFile(filename: string) {
  return async (data: string) => {
    const justCreate = () => Deno.writeTextFile(filename, data);

    const askOverwrite = async () =>
      askYesNo(`File ${filename} exists, overwrite`)
        .prompt()
        .then(ifYes(justCreate))
        .then(done);

    await exists(filename)
      .then(ifNo(justCreate))
      .then(ifYes(askOverwrite));
  };
}

/**
 * _Write_ message input to the given `Deno.run()` process **handle**.
 * Automatically appends a new-line character to the message.
 */
export function sendInput(handle: Deno.Writer & Deno.Closer) {
  return (message = "") =>
    handle.write(new TextEncoder().encode(message + "\n"));
}

/** _Read_ output from the given `Deno.run()` process **handle**. */
export function getOutput(handle: Deno.Reader & Deno.Closer) {
  return (accept = 1024) =>
    async () => {
      const max = 1024;
      const buf = new Uint8Array(accept > max ? accept : max);
      const got = <number> await handle.read(buf);
      return new TextDecoder()
        .decode(buf.subarray(0, accept < got ? accept : got))
        .trim();
    };
}
