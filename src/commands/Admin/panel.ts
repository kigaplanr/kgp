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
      name: "status",
      description: "Sends server status panel",
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

    if (interaction.options.getSubcommand() === "status") {
      const guildMembers = interaction.guild.members.fetch({
        withPresences: true,
      });
      const totalOnline = await (
        await guildMembers
      ).filter((member) => member.presence?.status === "online");

      const serverEmbed = new EmbedBuilder()
        .addFields([
          {
            name: `${emojis.users} Mitglieder`,
            value: `${interaction.guild?.memberCount}`,
            inline: true,
          },
          {
            name: `${emojis.online} Online`,
            value: `${totalOnline?.size}`,
            inline: true,
          },
          {
            name: `${emojis.review} Verifizierte Mitglieder`,
            value: `${
              interaction.guild?.roles.cache.get(process.env.VERIFIED_ROLE)
                ?.members.size
            }`,
            inline: true,
          },
        ])
        .setFooter({ text: `Letztes Update: ${new Date().toLocaleString()}` });

      interaction.reply({ content: "Done", ephemeral: true });
      (channel as TextChannel).send({ embeds: [serverEmbed] });
    }

    if (interaction.options.getSubcommand() === "faq") {
      const embed = new EmbedBuilder().setDescription(
        `Willkommen im **${interaction.guild?.name}** Server!

        All Fragen sind unten beantwortet, einfach auf das jeweilige Menü klicken.
        `
      );

      interaction.reply({ content: "Done!", ephemeral: true });
      (channel as TextChannel).send({ embeds: [embed] });
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
