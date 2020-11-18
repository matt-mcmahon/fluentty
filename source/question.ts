import { stdin, stdout } from "./io.ts";
import { Match } from "./match.ts";
import { Formatter, Prompt, Sanitizer, Validator } from "./prompt.ts";

type PromiseThen<T> = Promise<T>["then"];
type ThenCallback<T> = Parameters<PromiseThen<T>>;
type ThenSuccessCallback<T> = ThenCallback<T>[0];
type ThenFailureCallback<T> = ThenCallback<T>[1];

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
  #prompt: Prompt;

  constructor(value: Prompt) {
    this.#prompt = value;
  }

  static from(prompt: Prompt) {
    return new Question(prompt);
  }

  /**
   * Creates a new question by merging this question's Prompt with a new
   * Prompt.
   */
  map = (fn: (prompt: Prompt) => Prompt) => Question.from(fn(this.#prompt));

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
    const prompt = this.#prompt.concat({ suggestions });
    return new Match(prompt, ...suggestions);
  };

  /**
   * Set a default value for when the user provides no input. Replaces before
   * sanitize, acceptable, and validate functions are run.
   */
  defaultTo = (defaultTo: string) => {
    return {
      andSuggest: () =>
        this.map((prompt) =>
          prompt.concat({ defaultTo, suggestions: [defaultTo] })
        ),
      justAccept: () => this.map((prompt) => prompt.concat({ defaultTo })),
    };
  };

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

  then = () => {
    const then = (
      question: Question,
      thenCallback: ThenSuccessCallback<string>,
    ) => {
      let resolver;
      let rejecter;
      new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
      });
      return {
        IO() {
          question.IO().then(thenCallback);
        },
      };
    };
  };

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

  IO = () =>
    stdout(`${this.#prompt}`)
      .then(stdin)
      .then(this.#prompt.validate)
      .catch((reason): Promise<string> =>
        this.#prompt.retry ? this.IO() : Promise.reject(reason)
      );

  test = (input: string) => this.#prompt.validate(input);
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
