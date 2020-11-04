import { AssertFunction } from "../remote/asserts.ts";
import { stripColor } from "../remote/colors.ts";
import type { SetEnv } from "./configure.ts";
import { getOutput, sendInput } from "./prompt.ts";

export type JSONData = ReturnType<typeof JSON.parse>;

export async function readFile(filePath: string) {
  return Deno.readTextFile(filePath);
}

export async function stringifyJSON(data: JSONData) {
  return JSON.stringify(data, null, "\t");
}

export async function parseJSON(data: JSONData) {
  return JSON.parse(data);
}

export function strip(string: string) {
  return stripColor(string).trim();
}

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

export function makeSetter(): [
  () => Record<string, string>,
  SetEnv,
] {
  const actual: Record<string, string> = {};

  const set: SetEnv = (key: string) =>
    async (value: Promise<string> | string) => {
      actual[key] = await value;
      return value;
    };

  const get = () => actual;

  return [get, set];
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
