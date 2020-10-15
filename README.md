# What is it

`denoc` is a minimal tool that adds support for Deno to a codebase that targets Node.js. It takes as input a codebase targeting Node.js and produces a Deno compatible version. The setup is explicit, but simple and powerful.

## Config

With `denoc`, the user has full responsiblity of managing their Deno dependencies and to structure their codebase in a way with clean cut APIs where implementations are available for both Node.js and Deno.

Add a `denoc` field to your `package.json`:
```
"denoc": {
  "outDir": "deno_dist",
  "include": ["src", "glob/**/*"],
  "exclude": ["src/ignored.ts", "ignored"],
  "skip": ["node-only-module"],
  "map": {
    "os": "https://deno.land/std@0.74.0/node/os.ts",
    "src/node1.ts": "src/deno1.ts"
    "src/node2.ts": "https://deno.land/x/deno2.ts",
    "crypto": "src/deno_crypto.ts",
  },
  "copy": ["README.md"],
},
```

| Field | Description |
|---|---|
| `outDir` | output directory where Deno compatible source files will be emitted |
| `include` | Array of strings/globs for files and directories to be converted |
| `exclude`  | Array of strings/globs that negates included files and directories (only used together with `include`). Import statements for these files will be skipped unless mapped to another file (see [Depenency mapping](#depenency-mapping)) |
| `files` | Array of strings for files to be converted, used instead of `include` & `exclude` |
| `skip` | Array of strings for package names of dependencies that will be skipped altogether (for example modules exporting objects available in the global scope) |
| `map` | Dependency mapping (see [Depenency mapping](#depenency-mapping)) | 
| `copy` | Array of strings for files to copy to `outDir` |


### Depenency mapping

Depency mapping is used to swap out Node.js implementations for Deno compatible versions with the same API. Local source files or node_module dependencies can be swapped out for other local source files or published Deno modules, in any combination, mix and match. Source files mentioned here will take precendence over `exclude`.


## Comparison with `denoify`

`denoc` is an opinionated version of https://github.com/garronej/denoify. denoify supports polyfills of Node.js builtins, uses replacers to automatically select Deno compatible versions, and supports custom replacers that can be as complicated as the user wants. `denoc` doesn't do any of that stuff. The user selects dependencies explicitly, and needs to explicitly declare any replacement implementations.
