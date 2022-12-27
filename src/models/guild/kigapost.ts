import { prop, getModelForClass } from "@typegoose/typegoose";

/**
 * @prop {string} guildID - The ID of the guild
 * @prop {boolean} enabled - Whether the welcome system is enabled
 * @prop {boolean} holiday - Whether the welcome system is in holiday mode
 * @prop {string} postChannel - The channel to post the message in
 */
class KigaPost {
  @prop()
  guildID: string;

  @prop()
  enabled: boolean;

  @prop()
  holiday: boolean;

  @prop()
  postChannel: string;
}

const KigaPostModel = getModelForClass(KigaPost);

export default KigaPostModel;
