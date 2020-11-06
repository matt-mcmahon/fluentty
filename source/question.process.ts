import { bgBrightYellow, bold, red, stripColor } from "../remote/colors.ts";
import { askYesNo, Q, question } from "./question.ts";

const done = await Q(
  question("What is your name")
    .defaultTo("Arthur, King of the Britain's!"),
  question("What is your quest")
    .retry()
    .validate(
      (input) => /grail/i.test(input),
      () => "Perhaps you seek the ... grail?",
    )
    .format((input) =>
      bold(bgBrightYellow(red(
        input.replace(/[\!\.\?]?$/, "!"),
      )))
    ),
  question("What is your favorite color")
    .accept("red", "green")
    .accept("blue")
    .defaultTo("blue"),
  question("Which way?")
    .acceptPartial("left", "right")
    .retry(),
);

console.log(JSON.stringify(done));
