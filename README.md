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
    "src/node1.ts": "src/deno1.ts",
    "src/node2.ts": "https://deno.land/x/deno2.ts",
    "crypto": "src/deno_crypto.ts"
  },
  "copy": ["README.md"]
}
```

| Field | Description |
|---|---|
| `outDir` | Output directory where Deno compatible source files will be emitted |
| `include` | Array of files/dirs/globs of sources |
| `exclude`  | Array of files/dirs/globs that negates `include`. Import statements for these files will be ignored unless mapped to another file (see [dependency mapping](#dependency-mapping)) |
| `files` | Array of source files (use as an alternative for `include`/`exclude`) |
| `allow` | Array of dependencies that will be forwarded (for example dependencies used in a mapped alternative local source file) |
| `skip` | Array of dependencies that will be skipped (for example modules exporting objects available in the Deno global scope) |
| `map` | Dependency mapping (see [dependency mapping](#dependency-mapping)) | 
| `copy` | Array of files to copy to `outDir` |


### Dependency mapping

Dependency mapping is used to swap out Node.js implementations for Deno compatible versions with the same API. Local source files or node_module dependencies can be swapped out for other local source files or published Deno modules, in any combination, mix and match. Source files mentioned here will take precendence over `exclude`.


## Comparison with `denoify`

`denoc` is an opinionated version of https://github.com/garronej/denoify. denoify supports polyfills of Node.js builtins, uses replacers to automatically select Deno compatible versions, and supports custom replacers that can be as complicated as the user wants. `denoc` doesn't do any of that stuff. The user selects dependencies explicitly, and needs to explicitly declare any replacement implementations.
