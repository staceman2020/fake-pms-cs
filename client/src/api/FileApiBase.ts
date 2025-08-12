import type { FileApiEndpoints } from "../../../common/src/api/files/FileApiEndpoints";
import type {
  FileContent,
  FileMetadata,
} from "../../../common/src/api/files/FileApiTypes";
import { APIBase } from "./APIBase";

export class FileApiBase extends APIBase {
  private endpoints: FileApiEndpoints;

  constructor(endpoints: FileApiEndpoints) {
    super();
    this.endpoints = endpoints;
  }

  async listFiles(): Promise<FileMetadata[] | undefined> {
    return this.fetchJSON(this.endpoints.listFiles);
  }

  async readLatest(): Promise<FileContent | undefined> {
    return this.fetchJSON(this.endpoints.readLatest);
  }

  async writeFile(
    content: FileContent,
    backup: boolean = false
  ): Promise<string> {
    const url = backup
      ? `${this.endpoints.writeFile}?backup=true`
      : this.endpoints.writeFile;
    return this.postJSON(url, content);
  }

  async readFile(fileName: string): Promise<FileContent> {
    return this.fetchJSON(
      `${this.endpoints.readFile}?fileName=${encodeURIComponent(fileName)}`
    );
  }
}
