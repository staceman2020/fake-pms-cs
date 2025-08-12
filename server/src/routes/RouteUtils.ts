import express, { Express, Request, Response } from "express";

export class RouteUtils {
  static handleErrors(res: Response, action: string, fn: () => void) {
    try {
      fn();
    } catch (e) {
      if (e instanceof Error) {
        res.status(500).send(e.message);
      }
    }
  }
}
