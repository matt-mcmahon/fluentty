import { stdin, stdout } from "./io.ts";
import { Formatter, Prompt, Sanitizer, Validator } from "./prompt.ts";

class Match {
  #prompt: Promise<Prompt>;
  #options: string[];

  constructor(prompt: Promise<Prompt>, ...options: string[]) {
    this.#options = options;
    this.#prompt = prompt;
  }

  matchCase = () => this.#configureMatch("");
  ignoreCase = () => this.#configureMatch("i");

  #configureMatch = (flags: string) => {
    return {
      matchFull: () => this.#done(flags, "full"),
      matchInitial: () => this.#done(flags, "init"),
      matchPartial: () => this.#done(flags, "part"),
    };
  };

  #done = (flags: string, match: "full" | "init" | "part") => {
    const options = this.#options;
    const prompt = this.#prompt;

    const validator = (input: string) => {
      const maybes: string[] = [];
      const full = new RegExp(`^${input}$`, flags);
      const init = new RegExp(`^${input}`, flags);
      const part = new RegExp(`${input}`, flags);
      for (const option of options) {
        if (full.test(option)) return option;
        if (match === "init" && init.test(option)) maybes.push(option);
        if (match === "part" && part.test(option)) maybes.push(option);
      }
      return maybes.length === 1 ? maybes[0] : false;
    };

    return Question.from(prompt.then((prompt) =>
      Prompt.of({
        ...prompt,
        validators: [
          ...prompt.validators,
          validator,
        ],
      })
    ));
  };
}

/**
 * Initialize a new prompt, storing the given `message` and returning a
 * configuration object. You can chain methods to configure the prompt, for
 * example:
 *
 * ```js
 * Question.from("Do you want to continue")
 *   .accept("yes", "no").ignoreCase().matchInitial()
 *   .defaultTo("yes")
 *   .retry()
 *   .IO();
 * ```
 *
 * Produces:
 *
 * ```plaintext
 * > Do you want to continue (𝘆𝗲𝘀/no): _
 * ```
 *
 * Note that no IO will occur until you call the `IO()` method, which resolves
 * to a Promise<string>.
 *
 */
export class Question {
  #prompt: Promise<Prompt>;

  constructor(value: PromiseLike<Prompt> | Prompt) {
    this.#prompt = Promise.resolve(value);
  }

  static from(prompt: PromiseLike<Prompt> | Prompt) {
    return new Question(Promise.resolve(prompt));
  }

  /**
   * Creates a new question by merging this question's Prompt with a new
   * Prompt.
   */
  map = (fn: (prompt: Prompt) => Prompt) =>
    Question.from(this.#prompt.then(fn));

  /**
   * Adds one or more strings as valid (i.e. acceptable) input. These strings
   * will *not* be listed as suggested input.
   */
  accept = (...options: string[]) => {
    return new Match(this.#prompt, ...options);
  };

  /**
   * Adds one or more strings as valid (i.e. acceptable) input. These strings
   * *will* be listed as suggested input.
   */
  suggest = (...suggestions: readonly string[]) => {
    const prompt = this.#prompt.then(({ suggestions: current, ...prompt }) =>
      Prompt.of({
        ...prompt,
        suggestions: Array.from(new Set([...current, ...suggestions])),
      })
    );
    return new Match(prompt, ...suggestions);
  };

  /**
   * Set a default value for when the user provides no input. Replaces before
   * sanitize, acceptable, and validate functions are run.
   */
  defaultTo = (defaultTo: string) =>
    this.map((prompt) => prompt.concat({ defaultTo }));

  /**
   * Run after the user's input is found valid.
   */
  format = (...formatters: Formatter[]) =>
    this.map((prompt) => prompt.concat({ formatters }));

  /**
   * Retry when given invalid input.
   */
  retry = (retry = true) => this.map((prompt) => prompt.concat({ retry }));

  /**
   * Sanitizes the users input before trying to validate.
   */
  sanitize = (...sanitizers: Sanitizer[]) =>
    this.map((prompt) => prompt.concat({ sanitizers }));

  /**
   * Use a predicate to validate user input. If the validation function returns
   * `true`, the input is acceptable, if it returns `false` then input is not
   * valid.
   *
   * Validate is checked after the `defaultTo` and `accept` rules have been
   * applied. If you've set a `defaultTo` value, validate will never receive
   * the empty string.
   */
  validate = (...validators: Validator[]) =>
    this.map((prompt) => prompt.concat({ validators }));

  IO = () => {
    const doIO = (prompt: Prompt) =>
      stdout(`${prompt}`)
        .then(stdin())
        .then((input) => prompt.validate(input))
        .catch((reason): Promise<string> =>
          prompt.retry ? doIO(prompt) : Promise.reject(reason)
        );
    return this.#prompt.then(doIO);
  };
}

export function question(message: string) {
  return Question.from(Prompt.from(message));
}

/**
 * Ask the user a Yes/No question with "y", "n", etc.
 */
export function askYesNo(message: string): Question {
  return question(message)
    .suggest("yes", "no").ignoreCase().matchInitial()
    .retry();
}
