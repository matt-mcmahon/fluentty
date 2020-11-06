import { AssertFunction } from "../remote/asserts.ts";
import { getOutput, sendInput } from "./promptly.ts";
import { JSONData, strip } from "./utils.ts";

export async function checkForErrors(tp: TP) {
  let err: string;
  do {
    err = strip(await tp.readError());
    const isOkay: "okay" | "not okay" = err.startsWith("Check")
      ? "okay"
      : err.startsWith("Download")
      ? "okay"
      : err === ""
      ? "okay"
      : "not okay";
    if (isOkay === "not okay") {
      break;
    }
  } while (err !== "");
  return err;
}

export type TP = Readonly<{
  process: Deno.Process;
  tempDir: string;
  write: (message?: string) => Promise<number>;
  read: () => Promise<string>;
  readError: () => Promise<string>;
  end: () => Promise<void>;
}>;

export function configureTestProcess(script: string) {
  return async ({ pretest, posttest }: {
    pretest?: (tp: TP) => Promise<TP>;
    posttest?: (tp: TP) => Promise<TP>;
  } = {}): Promise<TP> => {
    const tempDir = await Deno.makeTempDir({ prefix: "test-" });

    const process = Deno.run({
      cmd: ["deno", "run", "--unstable", "--allow-all", script, tempDir],
      stderr: "piped",
      stdin: "piped",
      stdout: "piped",
    });

    const end = (): Promise<void> =>
      process.status()
        .then(({ success }) => {
          return success ? tp : Promise.reject(process.stderrOutput());
        })
        .then(posttest)
        .then(() => Deno.remove(tempDir, { recursive: true }))
        .finally(() => {
          process.stderr.close();
          process.stdin.close();
          process.stdout.close();
          process.close();
        });

    const tp: TP = {
      process,
      tempDir,
      write: sendInput(process.stdin),
      read: getOutput(process.stdout)(),
      readError: getOutput(process.stderr)(),
      end,
    };

    if (pretest != null) await pretest(tp);

    return tp;
  };
}

export function makeExpects(tp: TP, assertEquals: AssertFunction) {
  async function expectQuestion(expected: string) {
    const actual = strip(await tp.read());
    assertEquals(actual, expected);
  }

  async function answer(answer = "") {
    await tp.write(answer);
  }

  async function expectJSON(expected: JSONData) {
    const jsonString = strip(await tp.read());
    const jsonData = JSON.parse(jsonString);
    assertEquals(jsonData, expected);
  }

  async function expectNoErrors() {
    const actual = await checkForErrors(tp);
    const expected = "";
    assertEquals(actual, expected);
  }

  return { answer, expectJSON, expectNoErrors, expectQuestion };
}
