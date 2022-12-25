import { Schema, model } from "mongoose";

const User = new Schema({
  userID: {
    type: String,
  },
  count: {
    type: Number,
    default: 0,
  },
  messages: {
    type: Array,
  },
  requestedData: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ServerUser = model("users", User);

export default ServerUser;
