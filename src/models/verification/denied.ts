import { Schema, model } from "mongoose";

const DeniedVerifications = new Schema({
  userID: {
    type: String,
  },
});

const DeniedUser = model("denied-verficiation", DeniedVerifications);

export default DeniedUser;
