import { bundle } from "dts-bundle";
import { resolve } from "node:path";

async function extractDefinitions(inputFile: string, destination: string) {
  console.log(`Bundling definitions from ${inputFile}`);
  bundle({
    main: inputFile,
    name: "grist-plugin-api",
    out: destination,
    baseDir: inputFile,
  });
}

const [gristPath, outputDirectory] = process.argv.slice(2);
if (!gristPath) {
  throw "Expected argument 1 to be path to an input directory containing _grist.";
}
if (!outputDirectory) {
  throw "Expected argument 2 to be a path to an output directory.";
}
await extractDefinitions(resolve(gristPath), resolve(outputDirectory));
