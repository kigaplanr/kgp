import { ActionRowBuilder, EmbedBuilder } from "@discordjs/builders";
import {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  GuildChannel,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command";

import emojis from "../../styles/emojis";

export default new Command({
  name: "panel",
  description: "Panel setup",
  userPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "verification",
      description: "Sends the verification panel",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel to send the panel in",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: "privacy",
      description: "Sends the privacy panel",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel to send the panel in",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: "faq",
      description: "Sends the FAQ panel",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel to send the panel in",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
  ],
  run: ({ interaction, client }) => {
    const channel =
      interaction.options.getChannel("channel") ||
      (interaction.channel as TextChannel);
    if (interaction.options.getSubcommand() === "verification") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("verification-button")
          .setLabel("Verifizieren")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(`${emojis.id}`),
          new ButtonBuilder()
          .setCustomId("visitor-button")
          .setLabel("Besucher")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(`${emojis.role}`)
      );

      const embed = new EmbedBuilder().setDescription(
        `
              **Willkommen zur BAfEP Verifizierung**
              
              Um dich zu verifizieren, musst du folgende Schritte durchlaufen:
              - Unten auf den ersten Knopf klicken
              - Deine Klasse und deine E-Mail-Adresse eingeben und diese bestätigen (dieser Schritt ist notwendig, um dich zu verifizieren)
              - Eine Weile zu warten bis deine Verifizierung abgeschlossen ist.

              Falls du wegen Privatsphäre oder sonstigen Gründen deine E-Mail Adresse nicht angeben willst/kannst, bitten wir dich, <@578678204890349594> mit einem "Beweis" zu kontaktieren.

              Auch alle anderen sind Willkommen, ihr könnt euch ganz bequem über den 2. Knopf die "Besucher" Rolle geben lassen! :)
              Achtung: Sich als eine andere Person auszugeben bzw. falsche Daten anzugeben, ist nicht gerne gesehen und führt zu einem Ausschluss von der Verifikation.

              Es ist nicht verpflichtend deine E-Mail anzugeben, es ist nur ein schnellerer und einfacherer Prozess um SchülerInnen zu verifizieren.
              `
      );

      interaction.reply({ content: "Done", ephemeral: true });
      (channel as TextChannel).send({ embeds: [embed], components: [row] });
    }

    if (interaction.options.getSubcommand() === "privacy") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("delete-data")
          .setLabel("Daten löschen")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("check-data")
          .setStyle(ButtonStyle.Primary)
          .setLabel("Daten anzeigen")
          .setEmoji(`${emojis.review}`),
        new ButtonBuilder()
          .setCustomId("display-verificationcodes")
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Wiederherstellungscodes anzeigen")
          .setEmoji(`${emojis.file}`)
      );

      const embed = new EmbedBuilder().setDescription(
        `
          **Datenschutz, Privatsphäre**
          
          Nach dem Interagieren mit diesem Bot, speichern wir gewisse Daten über dich. 
          - Deine öffentliche Discord Profil Nummer
          - (Falls angegeben) Deine E-Mail Adresse
          - (Falls angegeben) Deine Klasse
          - (Falls angegeben) Beweismaterial für die Verifikation.

          Diese Daten werden nur für die Verifikation verwendet und nicht an Dritte weitergegeben.
          Natürlich gibt es die Möglichkeit komplett auszutreten, z.B. 
          - Bei Schulwechsel
          - Bei Schulabschluss
          - Bei Verlassen der Schule
          ... sonstige Gründe

          Du kannst mit dem 2. Knopf "Daten anzeigen", deine Daten (falls vorhanden) einsehen, und mit dem 1. Knopf "Daten löschen" deine Daten löschen lassen.
          Bei Verlust des alten (verifizierten) Kontos, gibt es die Möglichkeit, diesen Wiederherzustellen. Dazu benötigst du die Wiederherstellungs-Codes des alten Kontos.
          Um den Prozess zu starten, klicke auf den "Daten löschen" Knopf. Dieser wird dich durch den Prozess führen.
          `
      );

      interaction.reply({ content: "Done", ephemeral: true });
      (channel as TextChannel).send({ embeds: [embed], components: [row] });
    }

    if (interaction.options.getSubcommand() === "faq") {
      const embed = new EmbedBuilder().setDescription(
        `Willkommen im **${interaction.guild?.name}** Server!
        
        All Fragen sind unten beantwortet, einfach auf das jeweilige Menü klicken.
        `
      );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("questions")
          .setPlaceholder("Noch nichts ausgewählt :(")
          .addOptions([
            {
              label: "Was ist das hier?",
              description: "Erzählt dir mehr über uns",
              value: "first_option",
              emoji: `${emojis.botserver}`,
            },
            {
              label: 'Warum über "Discord"?',
              description: "Warum wird Discord als Plattform gewählt haben",
              value: "second_option",
              emoji: `${emojis.users}`,
            },
            {
              label: "Privatsphäre und Sicherheit",
              description: "Ist das hier Anonym und sicher?",
              value: "third_option",
              emoji: `${emojis.review}`,
            },
            {
              label: "Ziel des Servers",
              description: "Wieso, für was, warum?",
              value: "fourth_option",
              emoji: `${emojis.partner}`,
            },
            {
              label: "Wie kann ich beitreten oder verlassen",
              description: "Eine genaue Anleitung",
              value: "fifth_option",
              emoji: `${emojis.save}`,
            },
          ])
      );
      interaction.reply({ content: "Done!", ephemeral: true });
      (channel as TextChannel).send({ embeds: [embed], components: [row] });
    }
  },
});
