import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";

/**
 * @prop {string} guildID - The ID of the guild

 */
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
class Autoresponse {
  @prop()
  guildID: string;

  @prop()
  enabled: boolean;

  @prop()
  trigger: Array<{ trigger: string; response: string }>;
}

const AutoresponseModel = getModelForClass(Autoresponse);

export default AutoresponseModel;
