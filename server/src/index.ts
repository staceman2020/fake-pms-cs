// src/index.js
import dotenv from "@dotenvx/dotenvx";
import express, { Express, Request, Response } from "express";

import fs from "fs";
var bodyParser = require("body-parser");
var cors = require("cors");

function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory does not exist: ${directory}`);
  }
}

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Configure CORS globally
app.use(
  cors({
    origin: ["http://localhost:5180", "http://localhost:3030"], // Allow your client origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({ limit: "200mb" }));

// Serve static applications
//app.use(express.static("./static/roadmap"));

// Ensure the FORMS_DIRECTORY environment variable is set
const formsDirectory = process.env.FORMS_DIRECTORY;
if (!formsDirectory)
  throw new Error("FORMS_DIRECTORY environment variable is not set");

///////////////////////////////////////////////////////////////////////////////
//
//  DATABASE
//
///////////////////////////////////////////////////////////////////////////////

import { AppDataSourceManager } from "./database/AppDataSourceManager";
AppDataSourceManager.initializeInstance(app, formsDirectory);

///////////////////////////////////////////////////////////////////////////////
//
//  COMMON
//
///////////////////////////////////////////////////////////////////////////////

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

console.log("ENVIRONMENT TEST", process.env.ROADMAPS_DIRECTORY);

// We use this to detect that we are on the same server as the client

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
