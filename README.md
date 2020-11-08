# 𝓕𝓵𝓾𝓮𝓷 🆃 🆃 🆈

*Fluentty* is a [fluent] command-line interface builder that runs on [Deno].
Here's an example:

```javascript
import { * as colors }
  from "https://deno.land/std@0.76.0/fmt/colors.ts";
import { IO, question }
  from "https://raw.githubusercontent.com/matt-mcmahon/fluentty/v0.3.0/module.ts";

const questions = [
  question("What is your name")
    .defaultTo("Arthur, King of the Britain's!"),
  question("What is your quest")
    .retry()
    .validate(
      (input) => /grail/i.test(input),
      () => "Do you seek ... the grail ... perhaps?",
    )
    .format((input) => input.replace(/[\!\.\?]?$/, "!")),
  question("What is your favorite color")
    .accept("red", "green")
    .accept("blue")
    .format((color) =>
      color === "red"
        ? red('%s')
        : color === "green"
        ? green(color)
        : color === "blue"
        ? blue(color)
        : color
    ),
]

const answers = await IO(...questions)
```

In this example we're using the `question` and `IO` exports from *Fluentty* to ask the user a series of questions. Specifically:

1. "What is your name" will accept any input, and has "Arthur, King of the Britains" as the default answer.
2. "What is your quest" will accept only answers that contain the word "grail".
   Fluentty will add an exclamation point to the input, replacing other punctuation if necessary.
3. "What is your favorite color", will only accept "red", "green", and "blue" as answers.
   Fluentty will format the output so it shows in that color when output on the terminal.

For example:

```text
bash : matt@matt-desktop:~/@mwm/fluentty
     : [working ≡]
     > deno run --unstable source/question.process.ts ↵

Check file:///home/matt/@mwm/fluentty/source/question.process.ts
What is your name: (Arthur, King of the Britain's!) ↵
What is your quest: ↵
What is your quest: I seek a shrubbery! ↵
What is your quest: I seek the grail? ↵
What is your favorite color: (red, green, blue) blue ↵
```

Will produce the `answers`:

```js
[
  "Arthur, King of the Britain's!",
  "I seek the grail!",
  "\u001b[34mblue\u001b[39m"
]
```

[fluent]: https://dev.to/shoupn/what-is-a-fluent-api-2m4f
[deno]: https://deno.land/
