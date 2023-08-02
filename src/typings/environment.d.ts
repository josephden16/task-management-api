import { Request } from "express";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT?: string;
      PWD: string;
      MONGODB_URL: string;
      JWT_SECRET: string;
    }
  }
}

declare module "express" {
  export interface Request {
    user: any;
  }
}

declare module "express-serve-static-core" {
  export interface Request {
    user: any;
  }
}

export {};
