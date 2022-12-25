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
    logger.debug(message.content);
  }
}
