import { Message } from "discord.js";
import { ExtendedClient } from "../../structures/Client";
import { BaseEvent } from "../../structures/Event";

import Autoresponse from "../../models/guild/autoresponse";

const spammed = new Map<string, number>();

type AutoResponse = {
  trigger: string;
  response: string;
};

export default class MessageEvent extends BaseEvent {
  constructor() {
    super("messageCreate");
  }
  async run(client: ExtendedClient, message: Message) {
    if (message.author.bot) return;

    const autoresponse = await Autoresponse.findOne({
      guildID: message.guild.id,
    });

    if (!autoresponse) return;

    const array: AutoResponse[] = autoresponse.trigger;
    for (let index = 0, length = array.length; index < length; ++index) {
      if (message.content === array[index].trigger) {
        if (spammed.get(message.author.id) + 30000 > Date.now()) return;
        spammed.set(message.author.id, Date.now());
        message.reply(array[index].response);
      }
    }
  }
}
