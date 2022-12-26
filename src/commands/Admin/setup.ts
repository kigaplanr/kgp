import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import { ownerCheck } from "../../guards/owner";
import { Command } from "../../structures/Command";

interface Autoresponse {
  guildID: string;
  enabled: boolean;
  trigger: string;
  response: string;
}

interface Welcome {
  guildID: string;
  enabled: boolean;
  welcomeChannel: string;
  welcomerole: string;
  logchannel: string | null;
}

type Update = { enabled: boolean };
type WelcomeResponse = { content: string; ephemeral: boolean };

// database
import WelcomeSetup from "../../models/guild/welcome";
import Autoresponse from "../../models/guild/autoresponse";
import emojis from "../../styles/emojis";

export default new Command({
  name: "setup",
  description: "Setup the bot for the server",
  userPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "welcome",
      description: "Setup the welcome system",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "enable",
          description: "Boolean to enable or disable the welcome system",
          type: ApplicationCommandOptionType.Boolean,
          required: true,
        },
        {
          name: "channel",
          description: "The channel to send the welcome message",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
        {
          name: "role",
          description: "The role to give to the new member",
          type: ApplicationCommandOptionType.Role,
          required: false,
        },
        {
          name: "logchannel",
          description: "The channel to log new users to",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: "autoresponse",
      description: "Add an autoresponse to the server",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "enable",
          description: "Boolean to enable or disable the autoresponse",
          type: ApplicationCommandOptionType.Boolean,
          required: true,
        },
        {
          name: "trigger",
          description: "The trigger for the autoresponse",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "response",
          description: "The response for the autoresponse",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ],

  run: async ({ interaction, client }) => {
    await ownerCheck(interaction);
    if (interaction.replied) return;

    if (interaction.options.getSubcommand() === "welcome") {
      const enable: boolean = interaction.options.getBoolean("enable");
      const channel =
        interaction.options.getChannel("channel") || interaction.channel;
      const role =
        interaction.options.getRole("role") ||
        (process.env.JOIN_ROLE as unknown as Role);
      const logchannel = interaction.options.getChannel("logchannel");

      const isEnabled: boolean = enable ? true : false;

      const guildQuery = await WelcomeSetup.findOne({
        guildID: interaction.guild.id,
      });

      const isTextChannel = channel.type === ChannelType.GuildText;

      if (!isTextChannel)
        return interaction.reply({
          content: `${emojis.error} | Please provide a text channel`,
          ephemeral: true,
        });

      const update: Welcome = {
        guildID: interaction.guild.id,
        enabled: isEnabled,
        welcomeChannel: channel.id,
        welcomerole: role.id,
        logchannel:
          logchannel && logchannel.id ? logchannel.id : guildQuery?.logchannel,
      };

      const response: WelcomeResponse = {
        content: enable
          ? `${emojis.on} | Welcome system successfully enabled`
          : `${emojis.off} | Welcome system successfully disabled`,
        ephemeral: true,
      };

      return guildQuery
        ? (await WelcomeSetup.findOneAndUpdate(update)) &&
            interaction.reply(response)
        : (await WelcomeSetup.create(update)) &&
            interaction.reply({
              ...response,
              content: `${emojis.success} | Welcome system successfully enabled`,
            });
    }

    if (interaction.options.getSubcommand() === "autoresponse") {
      const enable: boolean = interaction.options.getBoolean("enable");
      const trigger: string = interaction.options.getString("trigger");
      const response: string = interaction.options.getString("response");

      const isEnabled: boolean = enable ? true : false;
      const responseQuery: Autoresponse = await Autoresponse.findOne({
        guildID: interaction.guild.id,
      });

      const update: Update | null =
        isEnabled === false && trigger === null && response === null
          ? { enabled: false }
          : isEnabled === true && trigger === null && response === null
          ? { enabled: true }
          : null;

      const result =
        update && !(isEnabled === false && !responseQuery)
          ? await Autoresponse.findOneAndUpdate(update)
          : isEnabled === false && !responseQuery
          ? {
              content: `${emojis.error} | Cant disable autoresponse if it is not setup`,
              ephemeral: true,
            }
          : null;

      if (result) {
        return interaction.reply({
          content:
            `${emojis.success} | Autoresponse successfully ` +
            (isEnabled ? "enabled" : "disabled"),
          ephemeral: true,
        });
      }

      const newResponse: Autoresponse =
        responseQuery && trigger && response
          ? await Autoresponse.findOneAndUpdate({
              guildID: interaction.guild.id,
              enabled: isEnabled,
              $push: {
                trigger: {
                  trigger: trigger,
                  response: response,
                },
              },
            })
          : null;

      if (newResponse) {
        return interaction.reply({
          content: `${emojis.success} | Added new autoresponse!`,
          ephemeral: true,
        });
      }

      await Autoresponse.create({
        guildID: interaction.guild.id,
        enabled: isEnabled,
        trigger: {
          trigger: trigger,
          response: response,
        },
      });

      return interaction.reply({
        content: `${emojis.success} | Autoresponse successfully setup!`,
        ephemeral: true,
      });
    }
  },
});
