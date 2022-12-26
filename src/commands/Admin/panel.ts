import { ActionRowBuilder, EmbedBuilder } from "@discordjs/builders";
import {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  TextChannel,
} from "discord.js";
import { ownerCheck } from "../../guards/owner";
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
    {
      name: "email",
      description: "Sends the email panel",
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
  run: async ({ interaction, client }) => {
    await ownerCheck(interaction);
    if (interaction.replied) return;

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

    if (interaction.options.getSubcommand() === "email") {
      const channel =
        interaction.options.getChannel("channel") || interaction.channel;

      const embed = new EmbedBuilder().setDescription(`
      Willkommen auf dem **${interaction.guild?.name}** Server!\n
      Hier sind alle wichtigen Informationen, Kontaktmöglichkeiten uvm. aufgelistet.
      
      **Allgemeines**
      - Bei Fragen zu den Regeln, Befehlen oder ähnlichem, wende dich an einen der Moderatoren im Chat.
      - Falls du einen Fehler jener Art in der Software entdeckst, melde ihn bitte direkt an die Entwickler.
      - Wir helfen dir gerne bei allen Probleme weiter, beachte jedoch dass wir nicht direkt antworten können.

      **Kontaktmöglichkeiten**
      - Im Chat können aktive Teammitglieder (falls sie das wollen) direkt angesprochen werden.
      - Du hast auch die Möglichkeit uns via privatem Ticket direkt zu kontaktieren.
      - Als letzte Möglichkeit bieten wir E-Mail an, diese findest du unten.

      **Registrierung und Verifizierungen**
      - Du hast die Möglichkeit dich als offiziellen BAfEP Schüler zu verifizieren. 
      - Als Schulsprecher kannst du auch deine Schule vertreten und Events ankündigen.
      - Für Abschlussklassen gibt es die Möglichkeit ihre Umfragen der Diplomarbeit hier zu teilen.

      **Datenschutz, Löschung und Co.**
      - Deine Daten kannst du selbstverständlich jederzeit manuell und automatisiert löschen lassen. Da diese Vorgang aber viele Resourcen benötigt, kannst du dies maximal nur 1. tun.
      - Falls deine Schule registriert ist, kannst du diese auf Anfrage komplett löschen lassen.
      - Wir übernehmen keine Haftung über die ausversehene Weitergabe deiner Daten (Name, Fotos) die in Planungen etc. vorkommen, da diese nicht verschlüsselt sind.

      **Weitere Informationen**
      Nachrichten von mir (diesem "Bot") sind immer mit einem "🤖" gekennzeichnet, sie stellen keinen richtigen Nutzer dar.
      Dieser wird jedoch von der Administration verwaltet, niemand anderes hat direkten Zugriff auf ihn - für die Sicherheit deiner Daten.
      Bei offizieller Beantragung der Schließung, wird dieser Server ohne Vorwarnung geschlossen und mit hoher Wahrscheinlichkeit gelöscht.
      `);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("email-button")
          .setLabel("Email anzeigen")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("📧"),
        new ButtonBuilder()
          .setLabel("Link")
          .setStyle(ButtonStyle.Link)
          .setURL(
            "https://discord.com/channels/1041005159477678170/1041294816471941262/1041300888716841042"
          )
      );

      interaction.reply({ content: "Done!", ephemeral: true });
      (channel as TextChannel).send({ embeds: [embed], components: [row] });
    }
  },
});
