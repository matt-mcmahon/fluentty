import { always } from "../remote/functional.ts";
import { getOutput, noop, sendInput } from "./io.ts";

export type TP = Readonly<{
  process: Deno.Process;
  write: (message?: string) => Promise<number>;
  read: () => Promise<string>;
  readError: () => Promise<string>;
  end: () => Promise<void>;
}>;

const decode = (value: Uint8Array) => new TextDecoder().decode(value);

const getUnconsumedOutput = async (tp: TP) => {
  return tp.process.output()
    .then(decode)
    .then((output) => {
      return output.length > 0 &&
        Promise.reject(`Error: unconsumed output\n\n${output}\n\n`);
    });
};

const getUnconsumedError = async (tp: TP) => {
  return tp.process.stderrOutput()
    .then(decode)
    .then((output) => {
      return output.length > 0 &&
        Promise.reject(`Error: unconsumed Error output\n\n${output}\n\n`);
    });
};

export function configureTestProcess(script: string, ...args: string[]) {
  return async ({ pretest, posttest }: {
    pretest?: (tp: TP) => Promise<TP>;
    posttest?: (tp: TP) => Promise<TP>;
  } = {}): Promise<TP> => {
    const process = Deno.run({
      cmd: ["deno", "run", "--unstable", "--allow-all", script, ...args],
      stderr: "piped",
      stdin: "piped",
      stdout: "piped",
    });

    /**
     * Ends the spawned process.
     *
     * If unconsumed output or error messages remain buffered when `end` is
     * invoked, end will reject with the unconsumed output as the reason.
     */
    const end = (): Promise<void> =>
      tp.process.status()
        .then(async ({ success }) => {
          return Promise.all([
            getUnconsumedOutput(tp),
            getUnconsumedError(tp),
          ]).then(always(tp))
            .then(posttest)
            .then(noop)
            .finally(() => {
              try {
                process.stderr.close();
              } catch {}
              try {
                process.stdin.close();
              } catch {}
              try {
                process.stdout.close();
              } catch {}
              try {
                process.close();
              } catch {}
            });
        });

    const tp: TP = {
      process,
      write: sendInput(process.stdin),
      read: getOutput(process.stdout)(),
      readError: getOutput(process.stderr)(),
      end,
    };

    if (pretest != null) await pretest(tp);

    return pretest ? pretest(tp) : tp;
  };
}
