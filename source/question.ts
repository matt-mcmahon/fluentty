import { stdin, stdout } from "./io.ts";
import { MapGivenInputPrompt as MapIP, Prompt } from "./prompt.ts";

export interface Matcher<T> {
  (...options: string[]): MapIP<T>;
}

const doIO = (prompt: Prompt) =>
  stdout(`${prompt}`)
    .then(stdin())
    .then((input) => prompt.validate(input))
    .catch((reason): Promise<string> => {
      return prompt.retry ? doIO(prompt) : Promise.reject(reason);
    });

const validateDefaultTo = (defaultTo: string) =>
  (input: string) => input === "" ? defaultTo : false;

const setDefaultTo = (defaultTo: string) =>
  ({ validators = [], suggestions, ...prompt }: Prompt) =>
    new Prompt({
      ...prompt,
      defaultTo,
      suggestions: [...new Set([...suggestions, defaultTo])],
      validators: [...validators, validateDefaultTo(defaultTo)],
    });

const setRetry = (value = true) =>
  (prompt: Prompt) =>
    new Prompt({
      ...prompt,
      retry: value,
    });

const addFormatters = (...additions: MapIP<string>[]) =>
  ({ formatters: current = [], ...prompt }: Prompt) =>
    new Prompt({
      ...prompt,
      formatters: [...current, ...additions],
    });

const addSanitizers = (...additions: MapIP<string>[]) =>
  ({ sanitizers: current = [], ...prompt }: Prompt) =>
    new Prompt({
      ...prompt,
      sanitizers: [...current, ...additions],
    });

const addSuggests = (
  match: Matcher<string | false>,
  ...suggestions: string[]
) =>
  (prompt: Prompt) =>
    new Prompt({
      ...prompt,
      suggestions: [...prompt.suggestions, ...suggestions],
      validators: [...prompt.validators, match(...suggestions)],
    });

const addAccepts = (
  match: Matcher<string | false>,
  ...accepts: string[]
) =>
  (prompt: Prompt) =>
    new Prompt({
      ...prompt,
      validators: [...prompt.validators, match(...accepts)],
    });

const match = (ignoreCase = false, partial = false): Matcher<string | false> =>
  (...options: string[]) =>
    (input: string, prompt: Prompt) => {
      const flags = ignoreCase ? "i" : "";
      const full = new RegExp(`^${input}$`, flags);
      const init = new RegExp(`^${input}`, flags);
      const maybe: string[] = [];
      for (const option in options) {
        if (full.test(option)) {
          return option;
        } else if (partial && init.test(option)) {
          maybe.push(option);
        }
      }
      return maybe.length === 1 ? maybe[1] : false;
    };

const addValidators = (...additions: MapIP<string | false>[]) =>
  ({ validators: current = [], ...prompt }: Prompt) =>
    new Prompt({
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
   * Adds one or more strings as valid (i.e. acceptable) input, but does not add
   * these strings to the prompt's hint.
   */
  accept = ({
    ignoreCase = false,
    partial = false,
    suggestions,
  }: {
    ignoreCase: boolean;
    partial: boolean;
    suggestions: string[];
  }) =>
    Question.from(
      this.#prompt.then(
        addAccepts(match(ignoreCase, partial), ...suggestions),
      ),
    );

  /**
   * Adds one or more strings as valid (i.e. acceptable) input, and suggests
   * them in the prompt's hint.
   */
  suggest = (ignoreCase = false, partial = false, ...suggestions: string[]) =>
    Question.from(
      this.#prompt.then(
        addSuggests(match(ignoreCase, partial), ...suggestions),
      ),
    );

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
  validate = (validator: MapIP<string | false>) =>
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
    .suggest(true, true)("yes", "no")
    .retry();
}

export const IO = async (...questions: Question[]) => {
  const answers: string[] = [];
  for await (const q of questions) {
    answers.push(await q.IO());
  }
  return answers;
};
