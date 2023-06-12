import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { rimraf } from "rimraf";
import { Docker } from "./utils/docker";

export async function downloadDockerImage(
  repoTag: string,
  destination: string
) {
  const docker = new Docker();
  console.info("Pulling Docker image", repoTag);
  await docker.pullImage(repoTag);
  console.info("Creating container");
  const container = await docker.createContainer({
    Image: repoTag,
    name: randomUUID(),
  });
  try {
    console.info("Cleaning up");
    const fullDestinationPath = resolve(destination);
    await rimraf(fullDestinationPath);
    console.info("Exporting container");
    await container.exportTo("/grist", fullDestinationPath);
  } finally {
    console.info("Cleaning up container");
    await container.remove({ force: true });
  }
  console.info("Done cleaning up container");
}

const [repoTag, destination] = process.argv.slice(2);
if (!repoTag) {
  throw "Expected argument 1 to be a docker image";
}
if (!destination) {
  throw "Expected argument 2 to be a path to an output directory.";
}
await downloadDockerImage(repoTag, destination);
