import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { clientsRouter } from "./routes/clients";
import { invoicesRouter } from "./routes/invoices";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.set("trust proxy", true);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN ?? true,
      credentials: true
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", healthRouter);
  app.use("/api", clientsRouter);
  app.use("/api", invoicesRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

