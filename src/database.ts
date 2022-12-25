import mongoose from "mongoose";

export function connect() {
  if (!process.env.MONGO_DB) return;
  mongoose
    .connect(process.env.MONGO_DB)
    .then(() => console.log(`Successfully connected to MongoDB`))
    .catch((err: string) => console.log(`Error connecting to MongoDB: ${err}`));
}
