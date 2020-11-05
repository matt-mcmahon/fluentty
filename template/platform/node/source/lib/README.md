# platform/node/source/lib/README.md

Create spec-compliant TypeScript for use on the NodeJS platform here, and it will be imported from `../gen`.
Use a common interface so you may run the same application code on every platform you support.
For example:

```ts
// common interface for the getEnv function
interface GetEnv {
  (name: string): string | undefined;
}

// in source/lib/getEnv.ts
export const getEnv: GetEnv = (name: string): string | undefined =>
  Deno.env.get(name);

// in platform/node/source/lib/getEnv.ts
export const getEnv: GetEnv = (name: string): string | undefined =>
  process.env[name];
```
