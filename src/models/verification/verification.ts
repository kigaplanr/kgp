import { Schema, model } from "mongoose";

const Verification = new Schema({
  userID: {
    type: String,
  },
  guildID: {
    type: String,
  },
  klasse: {
    type: String,
  },
  email: {
    type: String,
  },
  status: {
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
  requestedcodes: {
    type: Boolean,
  },
  recoverycodes: {
    type: Array,
  },
});

const User = model("verification", Verification);

export default User;
