import { brightWhite, dim } from "../remote/colors.ts";
import { exists } from "../remote/fs.ts";
export { stripColor } from "../remote/colors.ts";

function ask(message: string) {
  return new Prompt({ message });
}

export class Prompt {
  message: string;
  accept?: string[];
  defaultTo?: string;
  format?: (input: string, options: Prompt) => string;
  retry?: boolean;
  sanitize?: (input: string, options: Prompt) => string;
  validate?: (input: string, options: Prompt) => boolean;

  constructor(options: Prompt) {
    const {
      accept = [],
      defaultTo,
      format,
      message,
      retry,
      sanitize,
      validate,
    } = options;

    this.accept = accept;
    this.defaultTo = defaultTo;
    this.format = format;
    this.message = message;
    this.retry = retry;
    this.sanitize = sanitize;
    this.validate = validate;

    Object.freeze(this);
  }

  static set<K extends keyof Prompt>(key: K) {
    return (value: Prompt[K]) =>
      (options: Prompt): Prompt => ({ ...options, [key]: value });
  }

  static from(message: string) {
    return new Prompt({ message });
  }

  static check(prompt: Prompt) {
    return (input: string) =>
      Promise.resolve(input)
        .then(orDefault(prompt))
        .then(orSanitize(prompt))
        .then(orAccept(prompt))
        .then(orValidate(prompt))
        .then(orFormat(prompt));
  }

  static getHint(prompt: Prompt) {
    const { accept, defaultTo } = prompt;
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
}

function orAccept({ accept = [], defaultTo }: Prompt) {
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

/**
 * Initialize a new prompt, storing the given `message` and returning a Promise.
 * The configuration object can be customized by chaining one or more `then`
 * method calls, passing the following functions `accept`, `acceptPartial`,
 * `defaultTo`, `format`, `retry` `sanitize`, or `validate`.
 *
 * ```js
 * Question("Do you want to continue")
 *   .acceptPartial("yes", "no")
 *   .defaultTo("yes")
 *   .retry()
 *   .prompt()
 * ```
 * ```plaintext
 * > Do you want to continue (yes/no): _
 * ```
 *
 * Not that no IO will occur until you call the `prompt()` method, which should
 * be chained with a `catch(...)` method.
 *
 */
class Question {
  #prompt: Promise<Prompt>;

  constructor(value: Promise<Prompt>) {
    this.#prompt = value;
  }

  static from(prompt: PromiseLike<Prompt> | Prompt) {
    return new Question(Promise.resolve(prompt));
  }

  /**
   * Validate input using a Set of acceptable input strings. This set is checked
   * after the `sanitize` function is run.
   *
   * User input must match exactly. Given, `accept("Acceptable")`, the only
   * valid input will be the string "Acceptable". Entering  "accept",
   * "acceptable", or "a" will be rejected.
   *
   * Multiple calls to accept will add additional acceptable input to the list.
   * Given `question.accept("right").accept("left")` both `"left"` and `"right"`
   * will be acceptable input.
   *
   */
  accept(...input: string[]): Question {
    const prompt = this.#prompt.then((prompt): Prompt => {
      const { accept: current = [] } = prompt;
      const set = new Set([...current, ...input]);
      return Prompt.set("accept")([...set])(prompt);
    });
    return Question.from(prompt);
  }

  /**
   * Sets up a sanitize filter that allows the user to to answer prompts like
   * `accept("Yes", "No")` with "y", "Y", "Ye", "Yes", or "n", "no", "No", etc.
   *
   * @returns the option from the accept list that begins with the users input,
   *    if it matches exactly one accept option. Otherwise returns the input.
   */
  acceptPartial(...input: string[]): Question {
    const quest = this.accept(...input).sanitize(
      (input: string, { defaultTo, accept = [] }: Prompt) => {
        if (input.length === 0) return input;
        if (input === defaultTo) return input;
        const maybe: readonly string[] = accept.reduce(
          (maybe, accepts) =>
            accepts.startsWith(input) ? [...maybe, accepts] : maybe,
          [] as readonly string[],
        );
        return maybe.length === 1 ? maybe[0] : input;
      },
    );
    return quest;
  }

  /**
   * Set a default value for when the user provides no input. Replaces before
   * sanitize, acceptable, and validate functions are run.
   */
  defaultTo(value: string): Question {
    return Question.from(this.#prompt.then(Prompt.set("defaultTo")(value)));
  }

  /**
   * Run after the user's input is found valid.
   */
  format(formatter: (input: string, prompt: Prompt) => string): Question {
    return Question.from(this.#prompt.then(Prompt.set("format")(formatter)));
  }

  /**
   * When true, invalid input results in a re-prompt.
   *
   * @param value retry on invalid input
   */
  retry(value = true): Question {
    const prompt = this.#prompt.then(Prompt.set("retry")(value));
    return Question.from(prompt);
  }

  /**
   * Sanitizes the users input before matching against the accept list, or trying
   * to validate.
   */
  sanitize(sanitizer: (input: string, prompt: Prompt) => string): Question {
    const prompt = this.#prompt.then(Prompt.set("sanitize")(sanitizer));
    return Question.from(prompt);
  }

  /**
   * Use a predicate to validate user input. If the validation function returns
   * `true`, the input is acceptable, if it returns `false` then input is not
   * valid.
   *
   * Validate is checked after the `defaultTo` and `accept` rules have been
   * applied. If you've set a `defaultTo` value, validate will never receive the
   * empty string.
   */
  validate(validator: (input: string, prompt: Prompt) => boolean): Question {
    return Question.from(this.#prompt.then(Prompt.set("validate")(validator)));
  }

  prompt() {
    return this.#prompt.then((options) =>
      stdout(`${options.message}: ${Prompt.getHint(options)}`)
        .then(stdin)
        .then(Prompt.check(options))
        .catch((reason): Promise<string> => {
          return options.retry ? this.prompt() : Promise.reject(reason);
        })
    );
  }
}

export function question(message: string) {
  return Question.from(Prompt.from(message));
}

/**
 * Ask the user a Yes/No question with "y", "n", etc.
 */
export function askYesNo(message: string): Question {
  return question(message)
    .acceptPartial("yes", "no")
    .retry();
}

export const Q = async (...questions: Question[]) => {
  const answered: string[] = [];
  for await (const q of questions) {
    answered.push(await q.prompt());
  }
  return answered;
};

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
