import mongoose from "mongoose";
import Logger from "./logger";

const logger = new Logger();

export function connect() {
  if (!process.env.MONGO_DB) return;
  mongoose
    .connect(process.env.MONGO_DB)
    .then(() => logger.success(`Successfully connected to MongoDB`))
    .catch((err: string) => logger.error(`Error connecting to MongoDB: ${err}`));
}
