import {
  prop,
  getModelForClass,
  Severity,
  modelOptions,
} from "@typegoose/typegoose";

/**
 * @class Verification
 * @description Verification model
 * @property {string} userID - The user's ID
 * @property {string} guildID - The guild's ID
 * @property {string} klasse - The user's class
 * @property {string} email - The user's email
 * @property {string} status - The user's status
 * @property {Date} createdAt - The date when the verification was created
 * @property {Date} updatedAt - The date when the verification was updated
 * @property {boolean} requestedcodes - If the user requested recovery codes
 * @property {string[]} recoverycodes - The user's recovery codes
 * @docs https://typegoose.github.io/typegoose/docs/api/decorators/model-options/#allowmixed
 */
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
class Verification {
  @prop()
  userID: string;

  @prop()
  guildID: string;

  @prop()
  klasse: string;

  @prop()
  email: string;

  @prop()
  status: string;

  @prop({ default: Date.now })
  createdAt: Date;

  @prop({ default: Date.now })
  updatedAt: Date;

  @prop()
  requestedcodes: boolean;

  @prop()
  recoverycodes: string[];
}

const VerificationModel = getModelForClass(Verification);

export default VerificationModel;
