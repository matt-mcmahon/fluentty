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
    Prompt.of({
      ...prompt,
      defaultTo,
      suggestions: [...new Set([...suggestions, defaultTo])],
      validators: [...validators, validateDefaultTo(defaultTo)],
    });

const setRetry = (retry = true) =>
  (prompt: Prompt) => Prompt.of(prompt, { retry });

const addFormatters = (...additions: MapIP<string>[]) =>
  ({ formatters: current = [], ...prompt }: Prompt) =>
    Prompt.of({ ...prompt, formatters: [...current, ...additions] });

const addSanitizers = (...additions: MapIP<string>[]) =>
  ({ sanitizers: current = [], ...prompt }: Prompt) =>
    Prompt.of({ ...prompt, sanitizers: [...current, ...additions] });

const addSuggestions = (...suggestions: string[]) =>
  (validator: MapIP<string | false>) =>
    ({ suggestions: cs = [], validators: cv = [], ...prompt }: Prompt) =>
      Prompt.of({
        ...prompt,
        suggestions: [...cs, ...suggestions],
        validators: [...cv, validator],
      });

const addAccepts = (
  match: Matcher<string | false>,
  ...accepts: string[]
) =>
  (prompt: Prompt) =>
    Prompt.of({
      ...prompt,
      validators: [...prompt.validators, match(...accepts)],
    });

const match = () => new Match();

class Match {
  #prompt: Promise<Prompt>;
  #options: string[]
  flags: "" | "i";
  strategy: (option: string) => string;

  #full = (option: string) => `^${option}$`;
  #init = (option: string) => `^${option}`;

  constructor(prompt: Promise<Prompt>, ...options: string[]) {
    this.#options = options
    this.#prompt = prompt;
    this.flags = "";
    this.strategy = this.#full;
  }

  ignoreCase() {
    this.flags = "i";
    return this;
  }

  matchCase() {
    this.flags = "";
    return this;
  }

  matchFullPhrase() {
    this.strategy = this.#full;
    return this;
  }

  matchInitPhrase() {
    this.strategy = this.#init;
    return this;
  }

  done() {
    const makeValidator = (option: string) =>
      (input: string) => {
        const re = new RegExp(this.strategy(option), this.flags);
        return re.test(input) ? option : false;
      };
    return (prompt: Prompt) => {
      Prompt.of(
        {
          ...prompt,
          validators: [...prompt.validators, ...this.#options.map(makeValidator)],
        },
      );
    };
  }
}

const addValidators = (...additions: MapIP<string | false>[]) =>
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
   * Adds one or more strings as valid (i.e. acceptable) input, but does not add
   * these strings to the prompt's hint.
   */
  accept(...options: string[]) {
    return new Match(this.#prompt, options: string[]);
  }

  /**
   * Adds one or more strings as valid (i.e. acceptable) input, and suggests
   * them in the prompt's hint.
   */
  suggest(...suggestions: string[]) {
    const prompt = this.#prompt;
    return {
      matchCase(yes = true) {
        return {
          matchAll(all = true) {
            return Question.from(
              prompt.then((prompt) =>
                match(prompt)(true)(!yes)(!all)(...suggestions)
              ),
            );
          },
        };
      },
    };
  }

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
    .suggest("yes", "no")
    .matchCase(false)
    .matchAll(false)
    .retry();
}

export const IO = async (...questions: Question[]) => {
  const answers: string[] = [];
  for await (const q of questions) {
    answers.push(await q.IO());
  }
  return answers;
};
