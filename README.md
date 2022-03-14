# What is it

`denoc` is a minimal tool that adds support for Deno to a codebase that targets Node.js. It takes as input a codebase targeting Node.js and produces a Deno compatible version. The setup is explicit, but simple and powerful.

## Config

With `denoc`, the user has full responsiblity of managing their Deno dependencies and to structure their codebase in a way with clean cut APIs where implementations are available for both Node.js and Deno.

Add a `denoc` field to your `package.json`:
```
"denoc": {
  "outDir": "deno_dist",
  "main": "src/mod.ts",
  "dependencies": {
    "os": "https://deno.land/std@0.74.0/node/os.ts",
    "crypto": "src/deno_crypto.ts",
    "src/node1.ts": "src/deno1.ts",
    "src/node2.ts": "https://deno.land/x/deno2.ts",
    "src/ignored.ts": null,
    "node-only-module": null
  },
  "copy": ["README.md"]
}
```

| Field | Description |
|---|---|
| `main` | _Required_ The entrypoint source file. Will be transformed and put into `outDir`. |
| `outDir` | _Optional_ Output directory where Deno compatible source files will be emitted (defaults to '.') |
| `dependencies` | _Optional_ Dependency mapping (see [dependency mapping](#dependency-mapping)) |
| `copy` | _Optional_ Array of files to copy to `outDir` |


### Dependency mapping

Imports of the `main` entrypoint will be looked up in the `dependencies` object. Modules resolved using Module Resolution (imported from `node_modules`) needs to be declared by having their package name as key and an equivalent Deno implementation as value. This can be a remote module (`http`), local file path (starting with `./`) or `null` (to remove the import). Relative file paths are optional to exist in the `dependencies` object (key is the path relative to the `package.json`). If it exists, the import will be swapped out, if not, the file will also be transformed and put into `outDir` using the same translation rules as the `main` entry. Imports of a Deno compatible local source file (or it's transitive imports) will not be transformed, but will just be copied as-is to the `outDir`.

## Comparison with `denoify`

`denoc` is an opinionated version of https://github.com/garronej/denoify. denoify supports polyfills of Node.js builtins, uses replacers to automatically select Deno compatible versions, and supports custom replacers that can be as complicated as the user wants. `denoc` doesn't do any of that stuff. The user selects dependencies explicitly, and needs to explicitly declare any replacement implementations.

### `denoc@1.x.x`

[Readme for previous version](./README.v1.md)
