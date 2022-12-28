import { EmbedBuilder } from "discord.js";

import { ExtendedClient } from "../structures/Client";
import { BaseEvent } from "../structures/Event";
import { ExtendedButtonInteraction } from "../typings/Command";

export default class FAQEventInteraction extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }
  async run(client: ExtendedClient, interaction: ExtendedButtonInteraction) {
    if (!interaction.isStringSelectMenu) return;

    const option1 = new EmbedBuilder()
      .setDescription(
        `Der BAfEP Online Server verbindet virtuell die ganzen SchülerInnen aber auch Interessenten, komplett kostenlos.`
      )
      .setColor("Green");

    const option2 = new EmbedBuilder()
      .setDescription(
        `Discord ist eine gute und kostenlose Alternative zu anderen Messenger Apps wie WhatsApp oder Telegram. Es ist sehr einfach zu bedienen und bietet viele Funktionen.`
      )
      .setColor("Green");

    const option3 = new EmbedBuilder()
      .setDescription(
        `Alle Daten sind Verschlüsselt und werden nicht an Dritte weitergegeben. Das heißt, dass wir selbst deine Daten nicht einsehen können.\n\nWenn du nicht zufrieden bist, kannst du im #datenschutz Kanal dein Profil löschen lassen.`
      )
      .setColor("Green");

    const option4 = new EmbedBuilder()
      .setDescription(
        `Egal ob BAfEP Schüler, oder sogar jemand der Interesse an dem Besuch einer BAfEP hat, kann hier all seine Fragen/Probleme und Ideen loswerden. Es gibt im Internet sehr wenig Information über den Ablauf der verschiedenen Klassen und Praktikas der BAfEP, weswegen wir hier den "nicht wissenden" weiterhelfen wollen.`
      )
      .setColor("Green");

    const option5 = new EmbedBuilder()
      .setDescription(
        `Du kannst den Link https://discord.gg/c6G2b5nryU deinen Freunden oder anderen BAfEP SchülerInnen weiterleiten mit dem sie sich registrieren und beitreten können.\n\nDanach kannst du dich im <#1041090843072811108> Kanal als Schüler oder Besucher verifizieren lassen um alle Kanäle einsehen zu können.`
      )
      .setColor("Green");

    // @ts-ignore
    const choice = interaction.values[0];

    if (choice === "first_option") {
      interaction.reply({ embeds: [option1], ephemeral: true });
    }

    if (choice === "second_option") {
      interaction.reply({ embeds: [option2], ephemeral: true });
    }

    if (choice === "third_option") {
      interaction.reply({ embeds: [option3], ephemeral: true });
    }

    if (choice === "fourth_option") {
      interaction.reply({ embeds: [option4], ephemeral: true });
    }

    if (choice === "fifth_option") {
      interaction.reply({ embeds: [option5], ephemeral: true });
    }
  }
}
