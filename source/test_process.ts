import { always } from "../remote/functional.ts";
import { noop, readFrom, writeln } from "./io.ts";

export type TP = Readonly<{
  process: Deno.Process;
  write: (message?: string) => Promise<void>;
  read: () => Promise<string>;
  readError: () => Promise<string>;
  end: () => Promise<void>;
}>;

const decode = (value: Uint8Array) => new TextDecoder().decode(value);

/** reject if any unconsumed data is buffered in stdout */
const getUnconsumedOutput = async (tp: TP) => {
  return tp.process.output()
    .then(decode)
    .then((output) => {
      return output.length > 0 &&
        Promise.reject(`Error: unconsumed output\n\n${output}\n\n`);
    });
};

/** reject if any unconsumed data is buffered in stderr */
const getUnconsumedError = async (tp: TP) => {
  return tp.process.stderrOutput()
    .then(decode)
    .then((output) => {
      return output.length > 0 &&
        Promise.reject(`Error: unconsumed Error output\n\n${output}\n\n`);
    });
};

/** Attempt to close IO and then process */
const closeAll = (process: Deno.Process) =>
  () => {
    try {
      process.stderr?.close();
    } catch { /*do nothing*/ }
    try {
      process.stdin?.close();
    } catch { /*do nothing*/ }
    try {
      process.stdout?.close();
    } catch { /*do nothing*/ }
    try {
      process?.close();
    } catch { /*do nothing*/ }
  };

/** Runs the given script as a new process */
export function configureTestProcess(scriptPath: string, ...args: string[]) {
  return async ({ pretest, posttest }: {
    pretest?: (tp: TP) => Promise<TP>;
    posttest?: (tp: TP) => Promise<TP>;
  } = {}): Promise<TP> => {
    const process = Deno.run({
      cmd: ["deno", "run", "--unstable", "--allow-all", scriptPath, ...args],
      stderr: "piped",
      stdin: "piped",
      stdout: "piped",
    });

    /**
     * End the test process and check for errors
     *
     * If unconsumed stdout or stderr remain buffered when `end` is invoked, end
     * will reject with the unconsumed output as the reason.
     */
    const end = (): Promise<void> =>
      tp.process.status()
        .then(() =>
          Promise.all([
            getUnconsumedOutput(tp),
            getUnconsumedError(tp),
          ]).then(always(tp))
            .then(posttest)
            .then(noop)
            .finally(closeAll(tp.process))
        );

    const tp: TP = {
      process,
      write: writeln(process.stdin),
      read: readFrom(process.stdout),
      readError: readFrom(process.stderr),
      end,
    };

    return pretest ? pretest(tp) : tp;
  };
}
