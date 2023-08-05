import { Request } from "express";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT?: string;
      PWD: string;
      MONGODB_URL: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
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
    user: { id: string; email: string };
  }
}

export {};
