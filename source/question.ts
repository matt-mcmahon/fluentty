import { stdin, stdout } from "./io.ts";
import { Formatter, Prompt, Sanitizer, Validator } from "./prompt.ts";

const doIO = (prompt: Prompt) =>
  stdout(`${prompt}`)
    .then(stdin())
    .then((input) => prompt.validate(input))
    .catch((reason): Promise<string> => {
      return prompt.retry ? doIO(prompt) : Promise.reject(reason);
    });

const validateDefaultTo = (defaultTo: string): Validator =>
  (input: string) => input === "" && defaultTo;

const setDefaultTo = (defaultTo: string) =>
  ({ validators = [], suggestions, ...prompt }: Prompt) =>
    Prompt.of({
      ...prompt,
      defaultTo,
      suggestions: [...new Set([...suggestions, defaultTo])],
      validators: [...validators, validateDefaultTo(defaultTo)],
    });

const setRetry = (retry = true) =>
  (prompt: Prompt) => Prompt.of({ ...prompt, retry });

const addFormatters = (...additions: Formatter[]) =>
  ({ formatters: current = [], ...prompt }: Prompt) =>
    Prompt.of({ ...prompt, formatters: [...current, ...additions] });

const addSanitizers = (...additions: Sanitizer[]) =>
  ({ sanitizers: current = [], ...prompt }: Prompt) =>
    Prompt.of({ ...prompt, sanitizers: [...current, ...additions] });

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

const addValidators = (...additions: Validator[]) =>
  ({ validators: current = [], ...prompt }: Prompt) =>
    Prompt.of({
      ...prompt,
      validators: [...current, ...additions],
    });

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
 *   .IO()
 * ```
 * ```plaintext
 * > Do you want to continue (𝘆𝗲𝘀/no): _
 * ```
 *
 * Not that no IO will occur until you call the `IO()` method, which should
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
  defaultTo = (value: string) =>
    Question.from(this.#prompt
      .then(setDefaultTo(value)));

  /**
   * Run after the user's input is found valid.
   */
  format = (formatter: (input: string, prompt: Prompt) => string) =>
    Question.from(this.#prompt
      .then(addFormatters(formatter)));

  /**
   * When true, invalid input results in a re-prompt.
   *
   * @param value retry on invalid input
   */
  retry = (value = true) =>
    Question.from(this.#prompt
      .then(setRetry(value)));

  /**
   * Sanitizes the users input before matching against the accept list, or trying
   * to validate.
   */
  sanitize = (sanitizer: (input: string, prompt: Prompt) => string) =>
    Question.from(this.#prompt
      .then(addSanitizers(sanitizer)));

  /**
   * Use a predicate to validate user input. If the validation function returns
   * `true`, the input is acceptable, if it returns `false` then input is not
   * valid.
   *
   * Validate is checked after the `defaultTo` and `accept` rules have been
   * applied. If you've set a `defaultTo` value, validate will never receive the
   * empty string.
   */
  validate = (validator: Validator) =>
    Question.from(this.#prompt
      .then(addValidators(validator)));

  IO = () => this.#prompt.then(doIO);
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

export const IO = async (...questions: Question[]) => {
  const answers: string[] = [];
  for await (const q of questions) {
    answers.push(await q.IO());
  }
  return answers;
};
