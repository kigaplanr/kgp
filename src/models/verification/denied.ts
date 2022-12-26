import { prop, getModelForClass } from "@typegoose/typegoose";

/**
 * @class DeniedVerification
 * @description DeniedVerification model
 * @property {string} userID - The user's ID
 */
class DeniedVerification {
  @prop()
  userID: string;
}

const DeniedVerificationModel = getModelForClass(DeniedVerification);

export default DeniedVerificationModel;