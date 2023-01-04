import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

// database
import DeniedUser from "../../models/verification/denied";

type userType = {
  userID: string;
};

import { ExtendedClient } from "../../structures/Client";
import { BaseEvent } from "../../structures/Event";
import emojis from "../../styles/emojis";
import { ExtendedButtonInteraction } from "../../typings/Command";

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }
  async run(client: ExtendedClient, interaction: ExtendedButtonInteraction) {
    const role = process.env.VISITOR_ROLE;

    switch (interaction.customId) {
      case "visitor-button": {
        const isVerified = interaction.member.roles.cache.has(role);
        if (!isVerified) {
          await interaction.member.roles.add(role);
          return interaction.reply({
            content: `${emojis.success} | Erfolgreich als Besucher verifiziert!`,
            ephemeral: true,
          });
        }

        return interaction.reply({
          content: `${emojis.error} | Du bist bereits verifiziert.`,
          ephemeral: true,
        });
      }

      case "verification-button": {
        const modal = new ModalBuilder()
          .setTitle("Verification")
          .setCustomId("verification-modal");

        const Klasse = new TextInputBuilder()
          .setCustomId("input-klasse")
          .setLabel("In welche Klasse gehst du?")
          .setPlaceholder("3C")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(3)
          .setRequired(true);

        const Email = new TextInputBuilder()
          .setCustomId("input-email")
          .setLabel("Deine BAfEP Email Adresse")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("mein-name@meine-bafep.at")
          .setMaxLength(50)
          .setRequired(true);

        const KlassenRow =
          new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            Klasse
          );
        const EmailRow =
          new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            Email
          );
        modal.addComponents(KlassenRow, EmailRow);

        const embed = new EmbedBuilder()
          .setDescription(
            `Hallo <@${interaction.user.id}>, leider wurde deine vorherige Verifizierungsanfrage abgelehnt, weswegen du dich nicht mehr erneut verifizieren kannst.\n\nWenn du denkst, dass dies ein Fehler ist, kontaktiere bitte einen Administrator.`
          )
          .setColor("Red")
          .setTimestamp();

        const deniedQuery = (await DeniedUser.findOne({
          userID: interaction.user.id,
        })) as userType;
        if (deniedQuery)
          return interaction.reply({ embeds: [embed], ephemeral: true });

        await interaction.showModal(modal);
      }
    }
  }
}
