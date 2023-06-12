import Dockerode from "dockerode";
import type { Stream } from "node:stream";
import { extractAndFilterTransformer } from "./stream";

function waitForStreamClosed<T extends Stream>(
  dockerode: Dockerode,
  stream: T
) {
  return new Promise<void>((resolve, reject) =>
    dockerode.modem.followProgress(
      stream,
      (error) => (error ? reject(error) : resolve()),
      (progress) => {
        if ("status" in progress) {
          console.log(progress.status);
          return;
        }
        console.log(progress);
      }
    )
  );
}

export class DockerContainer {
  constructor(
    private readonly dockerode: Dockerode,
    private readonly container: Dockerode.Container
  ) {}

  public async exportTo(filterRootPath: string, destinationPath: string) {
    const exportStream = await this.getExportStream();
    const extractStream = exportStream.pipe(
      extractAndFilterTransformer(filterRootPath, destinationPath)
    );
    return await waitForStreamClosed(this.dockerode, extractStream);
  }

  public remove(options?: Dockerode.ContainerRemoveOptions) {
    return new Promise<void>((resolve) =>
      this.container.remove(options ?? {}, resolve)
    );
  }

  private getExportStream() {
    return new Promise<NodeJS.ReadableStream>((resolve, reject) =>
      this.container.export({}, (error, result) =>
        result ? resolve(result) : reject(error)
      )
    );
  }
}

export class Docker {
  constructor(private readonly dockerode: Dockerode = new Dockerode()) {}

  public async pullImage(repoTag: string) {
    const stream = await new Promise<Stream>((resolve, reject) =>
      this.dockerode.pull(repoTag, {}, (error, stream) =>
        stream ? resolve(stream) : reject(error)
      )
    );
    return await waitForStreamClosed(this.dockerode, stream);
  }

  public async createContainer(options: Dockerode.ContainerCreateOptions) {
    const dockerodeContainer = await new Promise<Dockerode.Container>(
      (resolve, reject) =>
        this.dockerode.createContainer(options, (error, result) =>
          result ? resolve(result) : reject(error)
        )
    );
    return new DockerContainer(this.dockerode, dockerodeContainer);
  }
}
