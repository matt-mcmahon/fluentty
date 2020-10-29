import { assertEquals } from "../../remote/asserts.ts";
import { configureTestProcess, makeExpects, TP } from "../utils.ts";

const script = "scripts/configure/package.process.ts";

const startTestProcess = configureTestProcess(script);

Deno.test("package.ts :: existing target/source, cancel", async () => {
  async function preTest(tp: TP) {
    const sourceDir = tp.tempDir + "/source";
    const targetDir = tp.tempDir + "/target";
    const sourceFile = sourceDir + "/package.json";
    const targetFile = targetDir + "/package.json";

    await Deno.mkdir(sourceDir, { recursive: true });
    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.writeTextFile(
      sourceFile,
      JSON.stringify({ name: "existing-source-name" }),
    );
    await Deno.writeTextFile(
      targetFile,
      JSON.stringify({ name: "existing-target-name" }),
    );
  }

  const tp = await startTestProcess({ preTest });
  const {
    answer: an,
    expectJSON: ej,
    expectNoErrors: ne,
    expectQuestion: eq,
  } = makeExpects(tp, assertEquals);

  await eq("Automatically Configure package.json Files: (yes/no)");
  await an("yes");
  await eq(
    `${tp.tempDir}/target/package.json file exists: (overwrite, merge, cancel)`,
  );
  await an("cancel");
  await ej({});
  await ne();
  await tp.end();
});

Deno.test("package.ts :: existing target/source, merge, default", async () => {
  async function preTest(tp: TP) {
    const sourceDir = tp.tempDir + "/source";
    const targetDir = tp.tempDir + "/target";
    const sourceFile = sourceDir + "/package.json";
    const targetFile = targetDir + "/package.json";

    await Deno.mkdir(sourceDir, { recursive: true });
    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.writeTextFile(
      sourceFile,
      JSON.stringify({ name: "existing-source-name" }),
    );
    await Deno.writeTextFile(
      targetFile,
      JSON.stringify({ name: "existing-target-name" }),
    );
  }

  const tp = await startTestProcess({ preTest });
  const {
    answer: an,
    expectJSON: ej,
    expectNoErrors: ne,
    expectQuestion: eq,
  } = makeExpects(tp, assertEquals);

  await eq("Automatically Configure package.json Files: (yes/no)");
  await an("yes");
  await eq(
    `${tp.tempDir}/target/package.json file exists: (overwrite, merge, cancel)`,
  );
  await an("merge");
  await eq("Repository name: (existing-target-name)");
  await an();
  await eq(`Repository version: (0.2.0)`);
  await an();
  await eq("Is this a private repository: (yes/no)");
  await an("yes");
  await ej({ "NPM_PACKAGE_NAME": "existing-target-name" });
  await ne();
  await tp.end();
});

Deno.test("package.ts :: existing files", async () => {
  async function preTest(tp: TP) {
    const sourceDir = tp.tempDir + "/source";
    const targetDir = tp.tempDir + "/target";
    const sourceFile = sourceDir + "/package.json";
    const targetFile = targetDir + "/package.json";

    await Deno.mkdir(sourceDir, { recursive: true });
    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.writeTextFile(sourceFile, JSON.stringify({ name: "source" }));
    await Deno.writeTextFile(targetFile, JSON.stringify({ name: "target" }));
  }

  const tp = await startTestProcess({ preTest });
  const {
    answer: an,
    expectJSON: ej,
    expectNoErrors: ne,
    expectQuestion: eq,
  } = makeExpects(tp, assertEquals);
  await eq("Automatically Configure package.json Files: (yes/no)");
  await an("yes");
  await eq(
    tp.tempDir + "/target/package.json file exists: (overwrite, merge, cancel)",
  );
  await an();
  await eq(`Repository name: (target)`);
  await an();
  await eq(`Repository version: (0.2.0)`);
  await an();
  await eq("Is this a private repository: (yes/no)");
  await an();
  await ej({ "NPM_PACKAGE_NAME": "target" });
  await ne();
  await tp.end();
});
