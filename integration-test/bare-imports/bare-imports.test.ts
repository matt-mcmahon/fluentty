import { assertEquals, fail } from "./asserts.ts";

const moduleId = Deno.env.get("NPM_PACKAGE_NAME");

moduleId == undefined ? failNoPackageName() : testModule(moduleId);

function failNoPackageName() {
  Deno.test(
    `integration: node.test.ts`,
    () => fail("environment variable NPM_PACKAGE_NAME was not set"),
  );
}

function testModule(moduleId: string) {
  runTest(`commonjs`, `require("${moduleId}");`);
  runTest(`module`, `import "${moduleId}";`);
}

function runTest(inputType: "commonjs" | "module", script: string) {
  const cmd = ["node", "--input-type", inputType, "-e", script];
  const test = async () => {
    const p = Deno.run({ cmd, stdout: "piped", stderr: "piped" });
    const stderr = await p.stderrOutput();
    const stdout = await p.output();
    const actual = await p.status();
    p.close();

    const td = new TextDecoder();
    const expected = { success: true, code: 0 };
    const message = td.decode(stderr) + td.decode(stdout);
    assertEquals(actual, expected, message);
  };
  Deno.test(`integration: ${script}`, test);
}
