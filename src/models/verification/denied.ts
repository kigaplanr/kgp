import { Schema, model } from "mongoose";

interface DeniedVerifications {
  userID: string;
}

const DeniedVerifications = new Schema({
  userID: {
    type: String,
  },
});

const DeniedUser = model<DeniedVerifications>(
  "denied-verficiation",
  DeniedVerifications
);

export default DeniedUser;
