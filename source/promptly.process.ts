import { bgBrightYellow, bold, red, stripColor } from "../remote/colors.ts";
import { Q, question } from "./promptly.ts";

const done = await Q(
  question("What is your name"),
  question("What is your quest")
    .retry()
    .validate((input) => input.length > 4)
    .format((input) => bold(bgBrightYellow(red(`"${input}!"`)))),
  question("What is your favorite color")
    .accept("red", "blue", "green")
    .defaultTo("Noooo..."),
  question("Which way?")
    .acceptPartial("left", "right")
    .retry(),
);

console.table(done.map(stripColor));
