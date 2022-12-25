import { Message } from "discord.js";
import { ExtendedClient } from "../structures/Client";
import { BaseEvent } from "../structures/Event";

export default class MessageEvent extends BaseEvent {
  constructor() {
    super("messageCreate");
  }
  async run(client: ExtendedClient, message: Message) {
    console.log(message.content);
  }
}
