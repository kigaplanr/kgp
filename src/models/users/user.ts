import { prop, getModelForClass } from "@typegoose/typegoose";

/**
 * @class User
 * @description User model
 * @property {string} userID - The user's ID
 * @property {number} count - The user's message count
 * @property {string[]} messages - The user's messages
 * @property {boolean} requestedData - If the user requested their data
 * @property {Date} createdAt - The date when the user was created
 * @property {Date} updatedAt - The date when the user was updated
 */
class User {
  @prop()
  userID: string;

  @prop({ default: 0 })
  count: number;

  @prop()
  messages: string[];

  @prop()
  requestedData: boolean;

  @prop()
  createdAt: Date;

  @prop()
  updatedAt: Date;
}

const UserModel = getModelForClass(User);

export default UserModel;
