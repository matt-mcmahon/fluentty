import { AssertFunction } from "../remote/asserts.ts";
import { getOutput, sendInput } from "./io.ts";
import { JSONData, strip } from "./utils.ts";

function checkForErrors(tp: TP) {
  return async ({ success }: Deno.ProcessStatus) => {
    const process = tp.process;
    const error = new TextDecoder().decode(await process.stderrOutput());
    const ok = success && error === "";
    return ok ? tp : Promise.reject();
  };
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

    /**
     * Ends the spawned process.
     *
     * If any error messages remain buffered when `end` is invoked, end will
     * reject with the buffered error output as the reason.
     *
     */
    const end = (): Promise<void> =>
      process.status()
        .then(checkForErrors(tp))
        .then(posttest)
        .then(() => Deno.remove(tempDir, { recursive: true }))
        .finally(() => {
          // process.stderr.close(); closed stderrOutput() , above
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
