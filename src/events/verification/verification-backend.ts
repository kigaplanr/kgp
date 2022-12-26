import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  TextChannel,
  Message,
  ComponentType,
  MessageComponentInteraction,
  Collection,
  Role,
  Snowflake,
} from "discord.js";
import { Token } from "../../functions/token";

import emojis from "../../styles/emojis";

// cooldowns
const buttonCooldown = new Set<string | Snowflake>();
const newRequestCooldown: number = 30000;
const checkDataCooldown: number = 30000;
const backupCodesCooldown: number = 90000;

interface VerificationFormFields {
  "input-klasse": string;
  "input-email": string;
}

interface VerificationRequest {
  userID: Snowflake | string;
  klasse: string;
  email: string;
  status: "N/A" | "Accepted" | "declined";
}

type userQueryType = {
  userID: Snowflake | string;
};

type collectorType = Collection<
  MessageComponentInteraction,
  Snowflake | string
>;

// database
import Verification from "../../models/verification/verification";
import DeniedUser from "../../models/verification/denied";

// events
import { ExtendedClient } from "../../structures/Client";
import { BaseEvent } from "../../structures/Event";
import { ExtendedButtonInteraction } from "../../typings/Command";

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }
  async run(client: ExtendedClient, interaction: ExtendedButtonInteraction) {
    switch (interaction.customId) {
      case "verification-modal": {
        const Klasse = interaction.fields.getTextInputValue(
          "input-klasse"
        ) as VerificationFormFields;
        const Email = interaction.fields.getTextInputValue(
          "input-email"
        ) as VerificationFormFields;

        const member = interaction.member as GuildMember;

        // if (buttonCooldown.has(interaction.user.id))
        //   return interaction.reply({
        //     content: `<@${interaction.user.id}> du kannst dies nur alle paar Minuten klicken.`,
        //     ephemeral: true,
        //   });
        // buttonCooldown.add(interaction.user.id);
        // setTimeout(() => buttonCooldown.delete(interaction.user.id), 60000);

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
        setTimeout(
          () => buttonCooldown.delete(interaction.user.id),
          newRequestCooldown
        );


        // generate five codes for the user
        let codes: string[] = [];
        for (let i = 0; i < 5; i++) {
          codes.push(Token.generateToken());
        }

        (await Verification.create({
          userID: (member as GuildMember).id,
          guildID: member.guild.id,
          messageID: interaction.message?.id,
          klasse: Klasse,
          email: Email,
          status: "N/A",
          requestedcodes: false,
          recoverycodes: codes,
        })) as VerificationRequest;

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

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      case "accept-verification": {
        const user = interaction.message?.embeds[0].footer?.text;

        const verifiedRole = interaction.guild?.roles.cache.get(
          process.env.VERIFIED_ROLE
        ) as Role;

        const verifiedUserInfo = await Verification.findOne({ userID: user });

        const acceptedEmbed = new EmbedBuilder()
          .setTitle("Verifizierung erfolgreich")
          .setDescription(
            `**Name:** <@${verifiedUserInfo}>\n**Klasse:** ${
              verifiedUserInfo?.klasse
            }\n**Email:** ${verifiedUserInfo?.email}
          
          Angenommen von ${
            interaction.user.tag
          } am ${new Date().toLocaleString()}`
          )
          .setColor("Green");

        await (interaction.message as Message).edit({
          embeds: [acceptedEmbed],
          components: [],
        });

        const newMember = interaction.guild?.members.cache.get(
          verifiedUserInfo?.userID
        );
        try {
          await newMember?.roles.add(verifiedRole!);
        } catch (error: unknown) {
          console.log(error);
          return;
        }

        await Verification.findOneAndUpdate(
          { userID: user },
          { status: "Accepted" }
        );

        return interaction.reply({
          content: `${emojis.success} | Erfolgreich angenommen`,
          ephemeral: true,
        });
      }

      case "decline-verification": {
        const user = interaction.message?.embeds[0].footer?.text;

        // get all the data of the given user
        const verifiedUserInfo = await Verification.findOne({ userID: user });
        const member = verifiedUserInfo?.userID;

        const declinedEmbed = new EmbedBuilder()
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
          embeds: [declinedEmbed],
          components: [],
        });

        await Verification.findOneAndUpdate(
          { userID: user },
          {
            status: "declined",

            recoverycodes: [],
          }
        );

        // "block" the user from verifying again
        (await DeniedUser.create({
          userID: member,
        })) as userQueryType;

        return interaction.reply({
          content: `Die Anfrage wurde abgelehnt.`,
          ephemeral: true,
        });
      }
      // TODO: Verification/Backup codes
      // case "display-verificationcodes": {
      //   if (buttonCooldown.has(interaction.user.id))
      //     return interaction.reply({
      //       content: `<@${interaction.user.id}> du kannst dies nur alle paar Minuten klicken.`,
      //       ephemeral: true,
      //     });
      //   buttonCooldown.add(interaction.user.id);
      //   setTimeout(() => buttonCooldown.delete(interaction.user.id), 120000);
      // }
      case "delete-data": {
        if (buttonCooldown.has(interaction.user.id))
          return interaction.reply({
            content: `<@${interaction.user.id}> du kannst dies nur alle paar Minuten klicken.`,
            ephemeral: true,
          });
        buttonCooldown.add(interaction.user.id);
        setTimeout(
          () => buttonCooldown.delete(interaction.user.id),
          backupCodesCooldown
        );

        const userQuery = (await Verification.findOne({
          userID: interaction.user.id,
        })) as userQueryType;

        if (
          !(interaction.member as GuildMember).roles.cache.has(
            process.env.VERIFIED_ROLE
          ) ||
          !userQuery
        ) {
          return interaction.reply({
            content: `${emojis.error} | Du bist (noch) nicht verifiziert.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("Daten löschen")
          .setDescription(
            `Bist du dir sicher, dass du deine Daten löschen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden.`
          );

        const cancelledEmbed = new EmbedBuilder()
          .setDescription(`${emojis.error} | Vorgang abgebrochen.`)
          .setColor("Red");

        const successEmbed = new EmbedBuilder()
          .setDescription(
            `${emojis.success} | Vorgang erfolgreich abgeschlossen.`
          )
          .setColor("Green");

        const timedOutEmbed = new EmbedBuilder()
          .setDescription(
            `${emojis.error} | Vorgang abgebrochen. (Zeitüberschreitung)`
          )
          .setColor("Red");

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("JA")
            .setLabel("Ja")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("NEIN")
            .setLabel("Nein")
            .setStyle(ButtonStyle.Primary)
        );

        const msg = (await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
          fetchReply: true,
        })) as Message;

        const collector = msg.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
          if (i.customId === "JA") {
            await (interaction.member as GuildMember).roles.remove(
              process.env.VERIFIED_ROLE!
            );
            await Verification.findOneAndDelete({
              userID: interaction.user.id,
            });

            await interaction.editReply({
              embeds: [successEmbed],
              components: [],
            });
          }

          if (i.customId === "NEIN") {
            await interaction.editReply({
              embeds: [cancelledEmbed],
              components: [],
            });
          }
        });

        collector.on("end", async (collected: collectorType, error: string) => {
          try {
            await interaction.editReply({
              embeds: [timedOutEmbed],
              components: [],
            });
          } catch (error) {
            console.log(error);
          }
        });
      }
      case "check-data": {
        const userQuery = await Verification.findOne({
          userID: interaction.user.id,
        });

        if (buttonCooldown.has(interaction.user.id))
          return interaction.reply({
            content: `<@${interaction.user.id}> du kannst dies nur alle paar Minuten klicken.`,
            ephemeral: true,
          });
        buttonCooldown.add(interaction.user.id);
        setTimeout(
          () => buttonCooldown.delete(interaction.user.id),
          checkDataCooldown
        );

        if (
          !(interaction.member as GuildMember).roles.cache.has(
            process.env.VERIFIED_ROLE
          ) ||
          !userQuery
        )
          return interaction.reply({
            content: `${emojis.error} | Du hast keine Daten zum Anzeigen.`,
            ephemeral: true,
          });

        const embed = new EmbedBuilder()
          .setTitle("Deine Daten")
          .setDescription(
            `**Name:** <@${interaction.user.id}>\n**Klasse:** ${userQuery.klasse}\n**Email:** ${userQuery.email}`
          )
          .setTimestamp()
          .setColor("Green");

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }
}
