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
  CommandInteraction,
} from "discord.js";
import { Token } from "../../functions/token";

import emojis from "../../styles/emojis";

// cooldowns
const buttonCooldown = new Set<string | Snowflake>();

import { cooldowns } from "../../cooldowns";

const verificationCooldown: number = cooldowns.verificationRequest;
const ___defaultCooldown: number = cooldowns.default;
const newRequestCooldown: number = cooldowns.newRequest;
const checkDataCooldown: number = cooldowns.checkData;
const backupCodesCooldown: number = cooldowns.backupCodes;

// collector cooldowns
const codeButtonTimeout: number = cooldowns.codeButton;
const deleteDataTimeout: number = cooldowns.deleteData;

// sleep function for data deletion
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  guildID?: Snowflake | string;
  klasse?: string;
  email?: string;
  status?: "N/A" | "Accepted" | "declined";
  requestedcodes?: boolean;
  recoverycodes?: Array<string>;
  createdAt?: Date;
  updatedAt?: Date;
};

type collectorType = Collection<
  MessageComponentInteraction,
  Snowflake | string
>;

function buttonCldw(interaction: CommandInteraction, cooldown: number) {
  if (buttonCooldown.has(interaction.user.id)) {
    return interaction.reply({
      content: `<@${interaction.user.id}> du kannst dies nur alle paar Sekunden klicken.`,
      ephemeral: true,
    });
  }
  buttonCooldown.add(interaction.user.id);
  setTimeout(() => buttonCooldown.delete(interaction.user.id), cooldown);
}

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

        if (
          buttonCldw(
            interaction as unknown as CommandInteraction,
            newRequestCooldown
          )
        )
          return;

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
              **Email:** || ${Email} ||`
          )
          .setColor("White")
          .setFooter({ text: `${member.user.id}` });

        const verificationUser = await Verification.findOne({
          userID: interaction.user.id,
        });
        if (verificationUser)
          return interaction.reply({
            content: `${emojis.error} | Du hast bereits eine Verifizierungsanfrage gestellt!`,
            ephemeral: true,
          });

        // generate five codes for the user
        let codes: string[] = [];
        for (let i = 0; i < 5; i++) {
          codes.push(Token.generateToken());
        }

        // create new data entry
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
          // log message for admins
          const PendingChannel = (await interaction.guild?.channels.fetch(
            process.env.ADMIN_CHANNEL
          )) as TextChannel;
          await PendingChannel.send({
            embeds: [pendingEmbed],
            components: [buttonRow],
          });
        } catch (error) {
          console.log(error);
          interaction.reply({
            content: `${emojis.error} | Es ist ein Fehler aufgetreten. Bitte versuche es erneut.`,
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
            `**Name:** <@${verifiedUserInfo.userID}>\n**Klasse:** ${
              verifiedUserInfo?.klasse
            }\n**Email:** || ${verifiedUserInfo?.email} ||
          
          Angenommen von ${
            interaction.user.tag
          } am ${new Date().toLocaleString()}`
          )
          .setColor("Green");

        // edit the log message, message ? accepted : declined
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
          content: `${emojis.success} | Nutzer erfolgreich angenommen`,
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

        // edit log message to declined & set the status to declined
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

      case "display-verificationcodes": {
        if (
          buttonCldw(
            interaction as unknown as CommandInteraction,
            backupCodesCooldown
          )
        )
          return;

        const userQuery = (await Verification.findOne({
          userID: interaction.user.id,
        })) as userQueryType;

        if (!userQuery)
          return interaction.reply({
            content: `${emojis.error} | Du bist (noch) nicht verifiziert.`,
            ephemeral: true,
          });

        const pendingEmbed = new EmbedBuilder()
          .setTitle("Codes anzeigen?")
          .setDescription(
            `**${emojis.notify} | Möchtest du dir deine Recovery-Codes wirklich anzeigen lassen?**\n\nHinweis: Wenn du hier fortfährst, werden hier deine einzigartigen Wiederherstellungs-Codes angezeigt. Bitte handle mit Bedacht.`
          )
          .setColor("Green");

        const codeEmbed = new EmbedBuilder()
          .setTitle("Deine Recovery-Codes")
          .setDescription(
            `**${userQuery.recoverycodes.join(
              "\n"
            )}**\n\n**Hinweis:** Die Codes sind nur einmal verwendbar und nicht mehr abrufbar, bitte notiere dir sie an einem sicheren Ort.`
          )
          .setColor("Green");

        const cancelCodeEmbed = new EmbedBuilder()
          .setDescription(
            `**${emojis.error} | Der Prozess wurde abgrebochen.**`
          )
          .setColor("Red");

        const codesTimedout = new EmbedBuilder()
          .setDescription(
            `**${emojis.error} | Der Prozess wurde abgebrochen, da du zu lange gebraucht hast.**`
          )
          .setColor("Red");

        const codeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("CODES-ZEIGEN")
            .setLabel("Codes anzeigen")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔑"),
          new ButtonBuilder()
            .setCustomId("ABBRECHEN")
            .setLabel("Abbrechen")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("❌")
        );

        const codeMsg = await interaction.reply({
          embeds: [pendingEmbed],
          components: [codeRow],
          fetchReply: true,
          ephemeral: true,
        });

        const codeCollector = codeMsg.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: codeButtonTimeout,
        });

        codeCollector.on("collect", async (i: MessageComponentInteraction) => {
          if (i.customId === "CODES-ZEIGEN") {
            // set the boolean to true so the user can't request codes again
            (await Verification.findOneAndUpdate({
              userID: interaction.user.id,
              requestedcodes: true,
            })) as userQueryType;

            await interaction.editReply({
              embeds: [codeEmbed],
              components: [],
            });
          }

          if (i.customId === "ABBRECHEN") {
            await interaction.editReply({
              embeds: [cancelCodeEmbed],
              components: [],
            });
          }
        });

        codeCollector.on(
          "end",
          async (collected: collectorType, error: string) => {
            try {
              await interaction.editReply({
                embeds: [codesTimedout],
                components: [],
              });
            } catch (error) {
              console.log(error);
            }
          }
        );

        return;
      }
      case "check-data": {
        const userQuery = await Verification.findOne({
          userID: interaction.user.id,
        });

        if (
          buttonCldw(
            interaction as unknown as CommandInteraction,
            checkDataCooldown
          )
        )
          return;

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
      case "delete-data": {
        if (
          buttonCldw(
            interaction as unknown as CommandInteraction,
            backupCodesCooldown
          )
        )
          return;

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

        const timedOutEmbed = new EmbedBuilder()
          .setDescription(
            `${emojis.error} | Vorgang abgebrochen. (Zeitüberschreitung)`
          )
          .setColor("Red");

        // processing embeds
        const processingEmbed = new EmbedBuilder()
          .setDescription(`${emojis.ploading} | Daten werden gesammelt...`)
          .setFooter({
            text: "Info: Schließe während des Vorgangs nicht das Fenster",
          })
          .setColor("White");

        const processingProfileEmbed = new EmbedBuilder()
          .setDescription(`${emojis.review} | Nutzerprofil abrufen ...`)
          .setColor("Green");

        const processingDataDeletion = new EmbedBuilder()
          .setDescription(`${emojis.notify} | Daten werden gelöscht ...`)
          .setFooter({
            text: "Info: Schließe während des Vorgangs nicht das Fenster",
          })
          .setColor("Yellow");

        const successEmbed = new EmbedBuilder()
          .setDescription(
            `${emojis.success} | Vorgang erfolgreich abgeschlossen.`
          )
          .setFooter({ text: "Du kannst nun das Fenster schließen." })
          .setColor("Green");

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

        const dataDeleteCollector = msg.channel.createMessageComponentCollector(
          {
            componentType: ComponentType.Button,
            time: deleteDataTimeout,
          }
        );

        dataDeleteCollector.on(
          "collect",
          async (i: MessageComponentInteraction) => {
            if (i.customId === "JA") {
              // processing embeds
              await interaction.editReply({
                embeds: [processingEmbed],
                components: [],
              });

              await wait(10000);

              await interaction.editReply({
                embeds: [processingProfileEmbed],
                components: [],
              });

              await wait(8000);

              await interaction.editReply({
                embeds: [processingDataDeletion],
                components: [],
              });

              await wait(5000);

              try {
                // remove the role
                await (interaction.member as GuildMember).roles.remove(
                  process.env.VERIFIED_ROLE
                );
                // delete the data
                await Verification.findOneAndDelete({
                  userID: interaction.user.id,
                });
              } catch (error) {
                console.log(error);
              }

              // success
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
          }
        );

        dataDeleteCollector.on(
          "end",
          async (collected: collectorType, error: string) => {
            try {
              await interaction.editReply({
                embeds: [timedOutEmbed],
                components: [],
              });
            } catch (error) {
              console.log(error);
            }
          }
        );
      }

      case "email-button": {
        const embed = new EmbedBuilder().setDescription(`
      Hey ${interaction.user.username}! 
      Hier ist die Email Adresse der Administration:

      \`bafep.discord@gmail.com\`

      Bitte verwende diese Kontaktmöglichkeit nur bei dringenden Anliegen, sonstige Fragen kannst du im Chat stellen.
      Wir werden uns so schnell wie möglich bei dir melden.
      `);

        try {
          if (interaction.customId === "email-button") {
            interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } catch (error) {
          console.log(error);
          return;
        }
      }
    }
  }
}
