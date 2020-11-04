# source/lib/README.md

Write TypeScript for the Deno platform here, and it will be imported from `../app`.
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
