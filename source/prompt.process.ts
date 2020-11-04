import { bgBrightYellow, bold, red } from "../remote/colors.ts";
import {
  accept,
  ask,
  defaultTo,
  format,
  prompt,
  retry,
  sanitize,
  stdout,
  validate,
} from "./prompt.ts";

await ask("What is your favorite color")
  .then(accept("red", "blue", "green"))
  .then(defaultTo("no wait..."))
  .then(prompt)
  .then((input) => stdout(`Your favorite color is ${input}.\n`));

await ask("Which way?")
  .then(accept("left", "right"))
  .then(sanitize((input, options) => {
    const maybe: string[] = options.accept.reduce((maybe, option) => {
      return option.startsWith(input.substr(0, 1)) ? [...maybe, option] : maybe;
    }, [] as string[]);
    return maybe.length === 1 ? maybe[0] : input;
  }))
  .then(retry())
  .then(prompt)
  .then((input) => stdout(`You go ${input}.\n`));

await ask("What is your quest")
  .then(retry())
  .then(validate((input) => input.length > 4))
  .then(format((input) => {
    return bold(bgBrightYellow(red(`"${input}!"`)));
  }))
  .then(prompt)
  .then((input) => stdout(`You exclaim to the heavens: \n\n\t${input}\n\n`));

{
  const json = {
    name: "Foo",
  };
  await ask("Repository name")
    .then(defaultTo(json.name))
    .then(prompt)
    .then((name) => ({ ...json, ...{ name } }))
    .then((response) => console.dir(response));
}
