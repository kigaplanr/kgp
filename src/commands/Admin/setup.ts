import {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
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

interface KigaPost {
  guildID: string;
  enabled: boolean;
  holiday: boolean;
  postChannel?: string;
}

type Update = { enabled: boolean };
type KigaPostResponse = { content: string; ephemeral: boolean };

// database
import KigaPost from "../../models/guild/kigapost";
import Autoresponse from "../../models/guild/autoresponse";
import emojis from "../../styles/emojis";

export default new Command({
  name: "setup",
  description: "Setup the bot for the server",
  userPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "kigapost",
      description: "Setup the post system",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "enable",
          description: "Boolean to enable or disable the post system",
          type: ApplicationCommandOptionType.Boolean,
          required: true,
        },
        {
          name: "holiday",
          description: "Whether the post system is in holiday mode",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
        {
          name: "postchannel",
          description: "The channel to post the messages to",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: "settings",
      description: "View the settings for the server",
      type: ApplicationCommandOptionType.Subcommand,
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

    if (interaction.options.getSubcommand() === "kigapost") {
      const enable: boolean = interaction.options.getBoolean("enable");
      const holiday: boolean = interaction.options.getBoolean("holiday");
      const postchannel =
        interaction.options.getChannel("postchannel") || interaction.channel;
      const isEnabled: boolean = enable ? true : false;
      const isHoliday: boolean = holiday ? true : false;

      const guildQuery = await KigaPost.findOne({
        guildID: interaction.guild.id,
      });

      const isTextChannel = postchannel.type === ChannelType.GuildText;

      if (!isTextChannel)
        return interaction.reply({
          content: `${emojis.error} | Please provide a text channel`,
          ephemeral: true,
        });

      const data: KigaPost = {
        guildID: interaction.guild.id,
        enabled: isEnabled,
        holiday: isHoliday,
        postChannel: postchannel.id,
      };

      const response: KigaPostResponse = {
        content: enable
          ? `${emojis.on} | Post system successfully enabled.`
          : `${emojis.off} | Post system successfully disabled.`,
        ephemeral: true,
      };

      return guildQuery
        ? (await KigaPost.findOneAndUpdate(data)) && interaction.reply(response)
        : (await KigaPost.create(data)) &&
            interaction.reply({
              ...response,
              content: `${emojis.success} | Post system successfully enabled.\nI will send messages to ${guildQuery.postChannel}`,
            });
    }

    if (interaction.options.getSubcommand() === "settings") {
      const postQuery = await KigaPost.findOne({ guild: interaction.guild.id });
      const autoresponseQuery = await Autoresponse.findOne({
        guild: interaction.guild.id,
      });

      if(!postQuery || !autoresponseQuery) return interaction.reply({ content: `${emojis.error} | No settings found for this server`, ephemeral: true });

      const postChannel = await interaction.guild.channels.cache.get(
        postQuery.postChannel
      );
      
      const postEnabled = postQuery.enabled ? `${emojis.on}` : `${emojis.off}`;
      const postHoliday = postQuery.holiday ? `${emojis.on}` : `${emojis.off}`;
      const autoresponseEnabled = autoresponseQuery.enabled ? `${emojis.on}` : `${emojis.off}`;

      const embed = new EmbedBuilder().setTitle("Guild Settings").addFields([
        {
          name: "Post System",
          value: `Enabled: ${postEnabled}\nHoliday: ${postHoliday}\nChannel: ${postChannel}`,
        },
        { name: "Autoresponse", value: `Enabled: ${autoresponseEnabled}` },
      ]);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "autoresponse") {
      const enable: boolean = interaction.options.getBoolean("enable");
      const trigger: string = interaction.options.getString("trigger");
      const response: string = interaction.options.getString("response");

      const isEnabled: boolean = enable ? true : false;
      const responseQuery: Autoresponse = await Autoresponse.findOne({
        guildID: interaction.guild.id,
      });

      const autoresponse = await Autoresponse.findOne(
        {
          $and: [
            { guildID: interaction.guild.id },
            { trigger: { $elemMatch: { trigger: trigger } } },
          ],
        },
        { trigger: { $elemMatch: { trigger: trigger } } }
      );

      if (autoresponse) {
        return interaction.reply({
          content: `${emojis.error} | The trigger "${trigger}" already exists`,
          ephemeral: true,
        });
      }

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
