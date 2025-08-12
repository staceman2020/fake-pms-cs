import fs from "fs";
var plantumlEncoder = require("plantuml-encoder");

import { FileMetadata } from "../../../common/src/api/files/FileApiTypes";
var cors = require("cors");

// See https://plantuml.com/en/picoweb
//https://plantuml.com/text-encoding

export abstract class AbstractFileManager<FC> {
  private lastProcessed: FC | undefined;

  constructor(
    protected _directory: string,

    protected _fileExtension: string
  ) {
    if (!fs.existsSync(this._directory)) {
      throw new Error(`Directory does not exist: ${this._directory}`);
    }
    // ensure the _fileExtension starts with a dot
    if (!this._fileExtension.startsWith(".")) {
      this._fileExtension = `.${this._fileExtension}`;
    }

    console.log(`PlantumlManager: directory: ${this._directory}`);
  }

  listFiles(): Promise<FileMetadata[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this._directory, (err, files) => {
        if (err) {
          reject(err);
        } else {
          const metadata = files.map((file) => {
            const lastModified = fs.statSync(
              `${this._directory}/{file}`
            ).mtimeMs;
            return {
              lastModified,
              name: file,
            };
          });
          resolve(metadata);
        }
      });
    });
  }

  getLatest(): FC | undefined {
    // Get the latest file
    let files = fs.readdirSync(this._directory);
    files = files.filter((file) => file.endsWith(this._fileExtension));

    console.log(
      "There are ",
      files.length,
      " files in the directory ",
      this._directory,
      " with extension ",
      this._fileExtension
    );

    if (files.length === 0) {
      console.log("No files found with the specified extension.");
      return undefined;
    }
    const latestFile = files.reduce(
      (latest, current) => {
        const currentLastModified = fs.statSync(
          `${this._directory}/${current}`
        ).mtimeMs;
        if (currentLastModified > latest.lastModified) {
          return {
            lastModified: currentLastModified,
            name: current,
          };
        }
        return latest;
      },
      { lastModified: 0, name: "" }
    );

    return this.process(latestFile.name);
  }

  abstract process(fileName: string): FC;
}
