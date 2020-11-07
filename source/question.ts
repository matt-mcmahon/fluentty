import { stdin, stdout } from "./io.ts";
import { MapGivenInputPrompt as MapIP, Prompt } from "./prompt.ts";

export interface Matcher {
  (input: string): (option: string) => boolean;
}

const doIO = (prompt: Prompt) =>
  stdout(`${prompt}`)
    .then(stdin)
    .then((input) => prompt.validate(input))
    .catch((reason): Promise<string> => {
      return prompt.retry ? doIO(prompt) : Promise.reject(reason);
    });

const exactMatch: Matcher = (input: string) =>
  (option: string) => input === option;

const partialMatch: Matcher = (input: string) =>
  (option: string) => option.startsWith(input);

const insensitive = (matchStrategy: Matcher) =>
  (input: string) =>
    (option: string) =>
      matchStrategy(input.toLocaleLowerCase())(option.toLocaleLowerCase());

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

const addExactSuggestions = (...additions: string[]) =>
  (prompt: Prompt) => {
    const match = exactMatch;
    const validate = (input: string) => additions.find(match(input)) ?? false;

    return new Prompt({
      ...prompt,
      suggestions: [...prompt.suggestions, ...additions],
      validators: [...prompt.validators, validate],
    });
  };

const addLooseSuggestions = (...additions: string[]) =>
  (prompt: Prompt) => {
    const match = insensitive(partialMatch);
    const validate = (input: string) => {
      const maybes = additions.filter(match(input));
      return maybes.length === 1 ? maybes[0] : false;
    };

    return new Prompt({
      ...prompt,
      suggestions: [...prompt.suggestions, ...additions],
      validators: [...prompt.validators, validate],
    });
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
   * Validate input using a list of suggested input strings. This list is
   * checked after the `sanitize` function is run.
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
  matchExactly = (...suggestions: string[]) =>
    Question.from(this.#prompt
      .then(addExactSuggestions(...suggestions)));

  /**
   * Sets up a sanitize filter that allows the user to to answer prompts like
   * `accept("Yes", "No")` with "y", "Y", "Ye", "Yes", or "n", "no", "No", etc.
   *
   * Returns the accept option that begins with the given user input, ignoring
   *  case, but only if the user's input matches **exactly only** option.
   *  Otherwise returns the input.
   */
  matchLoosely = (...suggestions: string[]) =>
    Question.from(this.#prompt
      .then(addLooseSuggestions(...suggestions)));

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
    .matchLoosely("yes", "no")
    .retry();
}

export const IO = async (...questions: Question[]) => {
  const answers: string[] = [];
  for await (const q of questions) {
    answers.push(await q.IO());
  }
  return answers;
};
