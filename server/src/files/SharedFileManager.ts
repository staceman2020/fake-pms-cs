import express, { Express, Request, Response } from "express";
import fs from "fs";
import { RouteUtils } from "../routes/RouteUtils";
var plantumlEncoder = require("plantuml-encoder");

import {
  FileContent,
  FileMetadata,
  SharedFileManagerApiUrls,
} from "../../../common/src/api/files/FileApiTypes";
var cors = require("cors");

// See https://plantuml.com/en/picoweb
//https://plantuml.com/text-encoding

export abstract class SharedFileManager {
  // private lastProcessed: FileContent | undefined;
  private _backupDirectory: string;

  constructor(protected _directory: string, protected _fileExtension: string) {
    if (!fs.existsSync(this._directory)) {
      throw new Error(`Directory does not exist: ${this._directory}`);
    }
    // ensure the _fileExtension starts with a dot
    if (!this._fileExtension.startsWith(".")) {
      this._fileExtension = `.${this._fileExtension}`;
    }

    this._backupDirectory = `${this._directory}/backup`;

    console.log(`PlantumlManager: directory: ${this._directory}`);
  }

  listFiles(): FileMetadata[] {
    console.log(
      "Listing files in directory:",
      this._directory,
      this._fileExtension
    );
    const files = fs.readdirSync(this._directory);
    const metadata = files.map((file) => {
      console.log("Processing file:", file);
      if (!file.endsWith(this._fileExtension)) {
        console.log("Skipping file (wrong extension):", file);
        return null;
      }
      const lastModified = fs.statSync(`${this._directory}/${file}`).mtimeMs;
      return {
        lastModified,
        name: file,
      };
    });
    return metadata.filter((m) => m !== null) as FileMetadata[];
  }

  readLatest(): FileContent | undefined {
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

    return this.readFile(latestFile.name);
  }

  readFile(fileName: string): FileContent | undefined {
    const filePath = `${this._directory}/${fileName}`;
    if (!fs.existsSync(filePath)) {
      return undefined;
    }
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lastModified = fs.statSync(filePath).mtimeMs;
    return {
      content,
      fileName,
      lastModified,
    };
  }

  // Write back
  writeFile(content: FileContent, backup: boolean): void {
    if (!content || !content.content || !content.fileName) {
      throw new Error("Invalid content to write");
    }

    if (backup) {
      // Create a backup directory if it doesn't exist
      if (!fs.existsSync(this._backupDirectory)) {
        fs.mkdirSync(this._backupDirectory, { recursive: true });
      }

      // Create a backup of the existing file
      const backupFilePath = `${this._backupDirectory}/${
        content.fileName
      }.${Date.now()}.bak`;
      fs.copyFileSync(`${this._directory}/${content.fileName}`, backupFilePath);
      console.log(`Backup created: ${backupFilePath}`);
    }

    const filePath = `${this._directory}/${content.fileName}`;
    fs.writeFileSync(filePath, content.content, { encoding: "utf8" });
    console.log(`File written: ${filePath}`);
  }

  registerRoutes(app: Express, urls: SharedFileManagerApiUrls): void {
    if (urls.listFiles) {
      console.log(`Registering route: ${urls.listFiles}`);
      app.options(urls.listFiles, cors());
      app.get(urls.listFiles, (req: Request, res: Response) => {
        RouteUtils.handleErrors(res, "get server sync", () => {
          res.send(this.listFiles());
        });
      });
    }

    if (urls.readLatest) {
      console.log(`Registering route: ${urls.readLatest}`);
      app.options(urls.readLatest, cors());
      app.get(urls.readLatest, (req: Request, res: Response) => {
        RouteUtils.handleErrors(res, "get latest file", () => {
          const latestFile = this.readLatest();
          if (latestFile) {
            res.send(latestFile);
          } else {
            res.status(404).send("No files found");
          }
        });
      });
    }

    if (urls.writeFile) {
      console.log(`Registering route: ${urls.writeFile}`);
      app.options(urls.writeFile, cors());
      app.post(
        urls.writeFile,
        express.json(),
        (req: Request, res: Response) => {
          RouteUtils.handleErrors(res, "write file", () => {
            const content: FileContent = req.body;
            const backup = req.query.backup === "true";
            this.writeFile(content, backup);
            res.send({ success: true });
          });
        }
      );
    }

    if (urls.readFile) {
      console.log(`Registering route: ${urls.readFile}`);
      app.options(urls.readFile, cors());
      app.get(urls.readFile, (req: Request, res: Response) => {
        RouteUtils.handleErrors(res, "read file", () => {
          const fileName = req.query.fileName as string;
          const fileContent = this.readFile(fileName);
          if (fileContent) {
            res.send(fileContent);
          } else {
            res.status(404).send("File not found");
          }
        });
      });
    }
  }
}
