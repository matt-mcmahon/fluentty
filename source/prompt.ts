import { brightWhite, dim } from "../remote/colors.ts";
import { exists } from "../remote/fs.ts";
export { stripColor } from "../remote/colors.ts";

export type Prompt = {
  accept: string[];
  message: string;
  defaultTo?: string;
  format?: (input: string, options: Prompt) => string;
  retry?: boolean;
  sanitize?: (input: string, options: Prompt) => string;
  validate?: (input: string, options: Prompt) => boolean;
};

/**
 * Validate input using a list of acceptable input strings. List is checked
 * after the `sanitize` function is run.
 */
export function accept(...accept: string[]) {
  return async (options: Prompt) => {
    const { accept: current = [], ...rest } = options;
    const set = new Set([...current, ...accept]);
    return { ...rest, accept: [...set] } as Prompt;
  };
}

/**
 * Sets up a sanitize filter that allows the user to to answer prompts like
 * `accept("Yes", "No")` with "y", "Y", "Ye", "Yes", or "n", "no", "No", etc.
 *
 * @returns the option from the accept list that begins with the users input,
 *    if it matches exactly one accept option. Otherwise returns the input.
 */
export function acceptPartial(...accepts: string[]) {
  return (options: Prompt) =>
    accept(...accepts)(options).then(
      sanitize((input: string, options: Prompt) => {
        if (input.length === 0) return input;
        if (input === options.defaultTo) return input;
        const maybe: readonly string[] = options.accept.reduce(
          (maybe, accepts) =>
            accepts.startsWith(input) ? [...maybe, accepts] : maybe,
          [] as readonly string[],
        );
        return maybe.length === 1 ? maybe[0] : input;
      }),
    );
}

/**
 * Initialize a new prompt, storing the given `message` and returning a Promise.
 * The configuration object can be customized by chaining one or more `then`
 * method calls, passing the following functions `accept`, `acceptPartial`,
 * `defaultTo`, `format`, `retry` `sanitize`, or `validate`.
 *
 * ```js
 * ask("Do you want to continue")
 *   .then(acceptPartial("yes", "no"))
 *   .then(defaultTo("yes"))
 *   .then(retry())
 *   .then(prompt)
 * ```
 * ```plaintext
 * > Do you want to continue (yes/no): _
 * ```
 *
 * Not that no IO will occur until you chain `then(prompt)` so this should be
 * the last `then`-method chain, but could be followed by one or more
 * `catch(...)`.
 *
 */
export function ask(message: string): Promise<Prompt> {
  return Promise.resolve({
    message,
    accept: [],
  });
}

export function askYesNo(
  message: string,
): Promise<Prompt> {
  return ask(message)
    .then(acceptPartial("yes", "no"))
    .then(retry());
}

/**
 * Ignores any input and returns Promise<void>
 */
export async function done() {}

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
 * Takes a set of options, and prompts the user.
 *
 * @param options
 */
export async function prompt(options: Prompt): Promise<string> {
  return stdout(`${options.message}: ${getHint(options)}`)
    .then(stdin)
    .then(orDefault(options))
    .then(orSanitize(options))
    .then(orAccept(options))
    .then(orValidate(options))
    .then(orFormat(options))
    .catch(orRetry(options));
}

/**
 * When true, invalid input results in a re-prompt.
 *
 * @param value retry on invalid input
 */
export function retry(value = true) {
  return async (options: Prompt) => set("retry")(value)(options);
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
 * If the `filename` exists, prompts the user before overwriting.
 */
export function verifyWriteTextFile(filename: string) {
  return async (data: string) => {
    const justCreate = () => Deno.writeTextFile(filename, data);

    const askOverwrite = async () =>
      ask(`File ${filename} exists, overwrite`)
        .then(acceptPartial("yes", "no"))
        .then(defaultTo("no"))
        .then(prompt)
        .then(ifYes(justCreate))
        .then(done);

    await exists(filename)
      .then(ifNo(justCreate))
      .then(ifYes(askOverwrite));
  };
}

function orRetry(options: Prompt) {
  return (...reason: unknown[]) => {
    console.error(...reason);
    return options.retry ? prompt(options) : Promise.reject(reason);
  };
}

function orAccept({ accept, defaultTo }: Prompt) {
  return async (input: string) =>
    accept.length === 0
      ? input
      : accept.includes(input) || input === defaultTo
      ? input
      : Promise.reject(
        new TypeError(
          `input ${input} is not default, ${defaultTo}, or in accept list [${
            accept.map((s) => `"${s}"`).join(", ")
          }]`,
        ),
      );
}

function orDefault(options: Prompt) {
  return async (input: string) =>
    input === "" && options.defaultTo != null
      ? options.defaultTo
      : input === "" && options.defaultTo == null
      ? Promise.reject(new TypeError(`no input, no default value`))
      : input;
}

function orFormat(options: Prompt) {
  return async (input: string) =>
    typeof options.format === "function"
      ? options.format(input, options)
      : input;
}

function orSanitize(options: Prompt) {
  return async (input: string) =>
    typeof options.sanitize === "function"
      ? options.sanitize(input, options)
      : input;
}

function orValidate(options: Prompt) {
  return async (input: string) => {
    if (typeof options.validate === "function") {
      return options.validate(input, options) ? input : Promise.reject(
        new TypeError(`input ${input} failed to validate`),
      );
    }
    return input;
  };
}

function set<K extends keyof Prompt>(key: K) {
  return (value: Prompt[K]) =>
    async (options: Prompt): Promise<Prompt> => ({ ...options, [key]: value });
}

function getHint({ accept, defaultTo }: Prompt) {
  const set = new Set(accept);

  if (defaultTo) set.add(defaultTo);

  const as = Array.from(set).map((s) =>
    s === defaultTo ? brightWhite(s) : dim(s)
  );

  const hint = as.length > 2
    ? dim("(") + as.join(dim(", ")) + dim(") ")
    : as.length > 0
    ? dim("(") + as.join(dim("/")) + dim(") ")
    : "";

  return hint;
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

/**
 * Set a default value for when the user provides no input. Replaces before
 * sanitize, acceptable, and validate functions are run.
 */
export const defaultTo = set("defaultTo");

/**
 * Run after the user's input is found valid.
 */
export const format = set("format");

/**
 * Sanitizes the users input before matching against the accept list, or trying
 * to validate.
 */
export const sanitize = set("sanitize");

/**
 * Use a rule-based validation method. If the validation function returns
 * `true`, `prompt(...)` will acceptable the input, if `false` then the prompt
 * will reject the input.
 *
 * __Note__:
 * If you provide a `defaultTo` value, you do not need to consider an empty
 * input string in your validate function. Empty input will be replaced with the
 * `defaultTo` value before your validation function is run.
 */
export const validate = set("validate");
