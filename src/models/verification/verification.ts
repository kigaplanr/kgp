import { Schema, model } from "mongoose";

interface VerificationType {
  userID: string;
  guildID: string;
  klasse: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  requestedcodes: boolean;
  recoverycodes: string[];
}

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

const User = model<VerificationType>("verification", Verification);

export default User;
