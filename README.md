# 𝓕𝓵𝓾𝓮𝓷 🆃 🆃 🆈

*Fluentty* is a [fluent] command-line interface builder that runs on [Deno].
Here's an example:

```javascript
import { blue, green, red }
  from "https://deno.land/std@0.76.0/fmt/colors.ts";
import { askYesNo, IO, question }
  from "https://raw.githubusercontent.com/matt-mcmahon/fluentty/v0.3.0/module.ts";

const questions = [
  askYesNo("Do you approach the bridge of death"),
  question("What is your name"),
    .defaultTo("Arthur, King of the Britains!")
  question("What is your quest")
    .retry()
    .validate((input) => /grail/i.test(input) ? input : false)
    .format((input) => input.replace(/[\!\.\?]?$/, "!")),
  question("What is your favorite color")
    .matchExactly("red", "green")
    .matchExactly("blue")
    .format((color) =>
      color === "red"
        ? red("%s")
        : color === "green"
        ? green(color)
        : color === "blue"
        ? blue(color)
        : color
    ),
  question("African or European")
    .matchLoosely("African", "European")
    .sanitize((input) =>
      input.substr(0, 1).toLocaleUpperCase() +
      input.substr(1).toLocaleLowerCase()
    )
    .retry(),
  question("Choose your hero")
    .matchLoosely("Sir", "Sir not Appearing in this Film")
    .retry(),
];

const answers = await IO(...questions);
```

In this example we're using the `question` and `IO` exports from *Fluentty* to ask the user a series of questions. Specifically:

1. "Do you approach the bridge of death" asks a simple Yes/No question.
   `askYesNo` accepts version of "yes" and "no",
   and automatically ignores case and retries when the user enters something ambiguous.
2. "What is your name" will accept any input,
   but has "Arthur, King of the Britains" as the default answer.
3. "What is your quest" will accept only answers that contain the word "grail",
   but will retry if the user fails to include the word "grail" in their input.
   Fluentty will add an exclamation point valid input, replacing other punctuation if necessary.
4. "What is your favorite color", will only accept "red", "green", and "blue" as answers.
   Fluentty will **not** automatically retry on invalid input.
   Valid input will be formatted so it shows in that color when output on the terminal.
5. "Choose your hero" allows you to pick from either "Sir" or "Sir not Appearing in this Film".
   As loosely matched, input must match one suggestion exactly, or partially match only one option.

For example:

```text
bash : matt@matt-desktop:~/@mwm/fluentty
     : [working ≡]
     > deno run --unstable source/question.process.ts ↵

Do you approach the bridge of death: (yes/no) y ↵
What is your name:  ↵
What is your quest: I seek a shrubbery! ↵
What is your quest: I seek the grail? ↵
What is your favorite color: (red, green, blue) red ↵
African or European: (African/European) eu ↵
Accept partial, full match: (Sir/Sir not Appearing in this Film) Sir ↵
```

Will produce the `answers`:

```js
[
        "yes",
        "Arthur, King of the Britains!",
        "I seek the grail!",
        "\u001b[31m%s\u001b[39m",
        "European",
        "Sir"
]
```

[fluent]: https://dev.to/shoupn/what-is-a-fluent-api-2m4f
[deno]: https://deno.land/
