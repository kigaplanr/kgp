import { Message } from "discord.js";
import Logger from "../logger";
import { ExtendedClient } from "../structures/Client";
import { BaseEvent } from "../structures/Event";

const logger = new Logger();

export default class MessageEvent extends BaseEvent {
  constructor() {
    super("messageCreate");
  }
  async run(client: ExtendedClient, message: Message) {
    const message_text = `${message.author.tag} in ${message.guild.name} said: \"${message.content}\"`
    logger.debug(message_text)
  }
}
