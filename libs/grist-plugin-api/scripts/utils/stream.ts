import { createWriteStream, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { extract } from "tar-stream";

export function extractAndFilterTransformer(
  filterRootPath: string,
  destinationPath: string
) {
  const prefixToRemove =
    filterRootPath.replace(/^\//, "").replace(/\/$/, "") + "/";
  const extractor = extract();
  extractor.on("entry", (header, stream, next) => {
    stream.on("finish", next);
    if (!header.name.startsWith(prefixToRemove)) {
      stream.resume();
      next();
      return;
    }
    const newName = header.name.slice(prefixToRemove.length);
    const fullDestinationPath = resolve(destinationPath, newName);
    if (header.type === "file") {
      stream.pipe(createWriteStream(fullDestinationPath));
    } else if (header.type === "directory") {
      mkdirSync(fullDestinationPath, { recursive: true });
      stream.resume();
    }
  });
  return extractor;
}
