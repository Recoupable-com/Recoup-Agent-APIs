import { Express } from "express";
import { Server } from "socket.io";

export interface ExpressExtends extends Express {
  io?: Server;
}
