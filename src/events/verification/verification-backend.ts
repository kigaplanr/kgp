import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  TextChannel,
  Message,
} from "discord.js";
import { Token } from "../../functions/token";
import DeniedUser from "../../models/verification/denied";

const buttonCooldown = new Set();

// database
import Verification from "../../models/verification/verification";
import VerifiedInfo from "../../models/verification/verification";

import { ExtendedClient } from "../../structures/Client";
import { BaseEvent } from "../../structures/Event";
import emojis from "../../styles/emojis";
import { ExtendedButtonInteraction } from "../../typings/Command";

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }
  async run(client: ExtendedClient, interaction: ExtendedButtonInteraction) {
    switch (interaction.customId) {
      case "verification-modal": {
        const Klasse = interaction.fields.getTextInputValue("input-klasse");
        const Email = interaction.fields.getTextInputValue("input-email");

        const member = interaction.member as GuildMember;

        const embed = new EmbedBuilder()
          .setDescription(
            `${emojis.success} | Deine Anfrage wurde erfolgreich gesendet!
          Diese wird nun von einem Moderator überprüft und so schnell wie möglich bearbeitet.
          Du wirst via Discord-Privatnachricht benachrichtigt, stelle sicher dass du diese [aktiviert](https://support.discord.com/hc/de/articles/217916488-Blocken-Datenschutzeinstellungen) hast.
          
          Solltest du innerhalb von 24-48 Stunden keine Antwort erhalten, wende dich bitte an einen Moderator.
          Vielen Dank für dein Verständnis!
          Mit freundlichen Grüßen,
          Dein **BAfEP** - Discord Team
          `
          )
          .setColor("Green");

        const pendingEmbed = new EmbedBuilder()
          .setTitle("Neue Verifizierungsanfrage")
          .setDescription(
            `**Name:** ${member.user.tag} (${member.user.id})
              **Klasse:** ${Klasse}
              **Email:** ${Email}`
          )
          .setColor("White")
          .setFooter({ text: `${member.user.id}` });

        const verificationUser = await Verification.findOne({
          userID: interaction.user.id,
        });
        if (verificationUser)
          return interaction.reply({
            content: "Du hast bereits eine Verifizierungsanfrage gestellt.",
            ephemeral: true,
          });

        if (buttonCooldown.has(interaction.user.id))
          return interaction.reply({
            content: `<@${interaction.user.id}> du kannst dies nur alle paar Sekunden klicken.`,
            ephemeral: true,
          });
        buttonCooldown.add(interaction.user.id);
        setTimeout(() => buttonCooldown.delete(interaction.user.id), 30000);

        interaction.reply({ embeds: [embed], ephemeral: true });

        // generate five codes for the user
        let codes: string[] = [];
        for (let i = 0; i < 5; i++) {
          codes.push(Token.generateToken());
        }

        await Verification.create({
          userID: (member as GuildMember).id,
          guildID: member.guild.id,
          messageID: interaction.message?.id,
          klasse: Klasse,
          email: Email,
          status: "N/A",
          requestedcodes: false,
          recoverycodes: codes,
        });

        const acceptButton = new ButtonBuilder()
          .setCustomId("accept-verification")
          .setLabel("Akzeptieren")
          .setStyle(ButtonStyle.Success);
        const declineButton = new ButtonBuilder()
          .setCustomId("decline-verification")
          .setLabel("Ablehnen")
          .setStyle(ButtonStyle.Danger);
        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          acceptButton,
          declineButton
        );

        try {
          const PendingChannel = interaction.guild?.channels.cache.get(
            process.env.ADMIN_CHANNEL
          ) as TextChannel;
          await PendingChannel.send({
            embeds: [pendingEmbed],
            components: [buttonRow],
          });
        } catch (error) {
          console.log(error);
          interaction.reply({
            content: "Es ist ein Fehler aufgetreten.",
            ephemeral: true,
          });
        }
      }

      case "accept-verification": {
        const user = interaction.message?.embeds[0].footer?.text;

        const verifiedRole = interaction.guild?.roles.cache.get(
          process.env.VERIFIED_ROLE
        );

        const verifiedUserInfo = await VerifiedInfo.findOne({ userID: user });
        const verificationMember = verifiedUserInfo.userID;

        const embed = new EmbedBuilder()
          .setTitle("Verifizierung erfolgreich")
          .setDescription(
            `**Name:** <@${verificationMember}>\n**Klasse:** ${
              verifiedUserInfo?.klasse
            }\n**Email:** ${verifiedUserInfo?.email}
          
          Angenommen von ${
            interaction.user.tag
          } am ${new Date().toLocaleString()}`
          )
          .setColor("Green");

        (interaction.message as Message).edit({
          embeds: [embed],
        });

        const newMember =
          interaction.guild?.members.cache.get(verificationMember);
        try {
          await newMember?.roles.add(verifiedRole!);
        } catch (error: unknown) {
          console.log(error);
          return;
        }

        await VerifiedInfo.findOneAndUpdate(
          { userID: user },
          { status: "Accepted" }
        );

        interaction.reply({
          content: `${emojis.success} | Erfolgreich angenommen`,
          ephemeral: true,
        });
      }

      case "decline-verification": {
        const user = interaction.message?.embeds[0].footer?.text;

        // get all the data of the given user
        const verifiedUserInfo = await VerifiedInfo.findOne({ userID: user });
        const member = verifiedUserInfo?.userID;

        const embed = new EmbedBuilder()
          .setTitle("Verifizierung abgelehnt")
          .setDescription(
            `**Name:** <@${member}>\n**Klasse:** ${
              verifiedUserInfo?.klasse
            }\n**Email:** ${verifiedUserInfo?.email}
                
                Angenommen von ${
                  interaction.user.tag
                } am ${new Date().toLocaleString()}`
          )
          .setColor("Red");

        (interaction.message as Message).edit({
          embeds: [embed],
          components: [],
        });

        await VerifiedInfo.findOneAndUpdate(
          { userID: user },
          {
            status: "declined",

            recoverycodes: [],
          }
        );

        // "block" the user from verifying again
        await DeniedUser.create({
          userID: member,
        });

        interaction.reply({
          content: `Die Anfrage wurde abgelehnt.`,
          ephemeral: true,
        });
      }
    }
  }
}
