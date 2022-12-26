import { prop, getModelForClass } from "@typegoose/typegoose";

/**
 * @prop {string} guildID - The ID of the guild
 * @prop {boolean} enabled - Whether the welcome system is enabled
 * @prop {string} welcomeChannel - The ID of the welcome channel
 * @prop {string} welcomerole - The ID of the welcome role
 * @prop {string} logchannel - The ID of the log channel
 */
class Welcome {
  @prop()
  guildID: string;

  @prop()
  enabled: boolean;

  @prop()
  welcomeChannel: string;

  @prop()
  welcomerole: string;

  @prop()
  logchannel: string;
}

const WelcomeModel = getModelForClass(Welcome);

export default WelcomeModel;
