import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { ownerCheck } from "../../guards/owner";
import { Command } from "../../structures/Command";

import Autoresponse from "../../models/guild/autoresponse";
import emojis from "../../styles/emojis";

type Operation = { $set: Record<string, string> } | {};

type NewTrigger = string;
type Response = string;

export default new Command({
  name: "manage",
  description: "Manage the setups",
  userPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "edit-response",
      description: "Manage the autoresponses responses",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "trigger",
          description: "The trigger you want to edit",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "newtrigger",
          description: "Edit the trigger itself",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "response",
          description: "Edit the triggerse response",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "view-responses",
      description: "View all autoresponses",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "delete-responses",
      description: "Delete autoresponses",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "trigger",
          description: "The trigger you want to delete",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  run: async ({ interaction, client }) => {
    await ownerCheck(interaction);
    if (interaction.replied) return;

    if (interaction.options.getSubcommand() === "edit-response") {
      const trigger = interaction.options.getString("trigger");
      const newtrigger = interaction.options.getString("newtrigger");
      const response = interaction.options.getString("response");

      const guildQuery = await Autoresponse.findOne({
        guild: interaction.guild.id,
      });
      if (!guildQuery)
        return interaction.reply({
          content: `${emojis.error} | No autoresponse setup found.`,
          ephemeral: true,
        });

      const triggerQuery = guildQuery.trigger.find(
        (t) => t.trigger === trigger
      );

      if (!triggerQuery)
        return interaction.reply({
          content: `${emojis.error} | No trigger \`${trigger}\` found.`,
          ephemeral: true,
        });

      const operation: Operation =
        newtrigger && response
          ? {
              $set: {
                "trigger.$[elem].trigger": newtrigger,
                "trigger.$[elem].response": response,
              },
            }
          : (newtrigger as NewTrigger)
          ? { $set: { "trigger.$[elem].trigger": newtrigger } }
          : (response as Response)
          ? { $set: { "trigger.$[elem].response": response } }
          : {};

      await Autoresponse.updateOne(
        { guild: interaction.guild.id, "trigger.trigger": trigger },
        operation,
        { arrayFilters: [{ "elem.trigger": trigger }] }
      );

      return interaction.reply({
        content: `${
          emojis.success
        } | Autoresponse updated successfully.\n I will now answer to \`${
          newtrigger || trigger
        }\` with \`${response}\``,
        ephemeral: true,
      });
    }

    if (interaction.options.getSubcommand() === "view-responses") {
      const guildQuery = await Autoresponse.findOne({
        guild: interaction.guild.id,
      });
      if (!guildQuery)
        return interaction.reply({
          content: `${emojis.error} | No autoresponse setup found.`,
          ephemeral: true,
        });

      const triggers = guildQuery.trigger
        .map((t) => `\`${t.trigger}\` - \`${t.response}\``)
        .join("\n");

      const embed = new EmbedBuilder()
        .setDescription(triggers)
        .setColor("Random");

      interaction.reply({
        content: "Here are all the autoresponses:",
        embeds: [embed],
        ephemeral: true,
      });
    }
    if (interaction.options.getSubcommand() === "delete-responses") {
      const trigger = interaction.options.getString("trigger");

      const guildQuery = await Autoresponse.findOne({
        guild: interaction.guild.id,
      });
      if (!guildQuery)
        return interaction.reply({
          content: `${emojis.error} | No autoresponse setup found.`,
          ephemeral: true,
        });

      const triggerQuery = guildQuery.trigger.find(
        (t) => t.trigger === trigger
      );

      if (!triggerQuery)
        return interaction.reply({
          content: `${emojis.error} | No trigger \`${trigger}\` found.`,
          ephemeral: true,
        });

      // remove the trigger from the array
      await Autoresponse.updateOne(
        { guild: interaction.guild.id },
        { $pull: { trigger: { trigger } } }
      );

      return interaction.reply({
        content: `${emojis.success} | Trigger \`${trigger}\` deleted successfully.`,
        ephemeral: true,
      });
    }
  },
});
