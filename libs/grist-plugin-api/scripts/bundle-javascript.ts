import { BuildOptions, Format, build } from "esbuild";
import { resolve } from "node:path";

async function bundle(inputFile: string, destination: string, format: Format) {
  const config = {
    resolveExtensions: [".js"],
    entryPoints: [inputFile],
    outfile: destination,
    bundle: true,
    platform: "browser",
    format,
    external: ["grain-rpc", "ts-interface-checker"],
  } satisfies BuildOptions;
  console.log("Bundling into", config.outfile);
  const result = await build(config);
  console.log("Done bundling", result);
}

const [workingDir, destination, format] = process.argv.slice(2);
if (!workingDir) {
  throw "Expected argument 1 to be path to a working directory containing node_modules.";
}
if (!destination) {
  throw "Expected argument 2 to be a path to an output file.";
}
if (!format) {
  throw "Expected argument 3 to be a format.";
}
await bundle(resolve(workingDir), resolve(destination), format as Format);
