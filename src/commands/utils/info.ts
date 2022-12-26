import {
  ApplicationCommandOptionType,
  ChannelType,
  GuildChannel,
  GuildMember,
  EmbedBuilder,
  Role,
  Colors,
} from "discord.js";
import { Command } from "../../structures/Command";
import axios from "axios";
import { ownerCheck } from "../../guards/owner";

export default new Command({
  name: "info",
  description: "Get information about things.",
  options: [
    {
      name: "user",
      description: "Show info for a user",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Show info for a user",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      name: "channel",
      description: "Show info for a channel",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Show info for a channel",
          type: ApplicationCommandOptionType.Channel,
          required: true,
          channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice],
        },
      ],
    },
    {
      name: "role",
      description: "Show info for a role",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "Show info for a role",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: "server",
      description: "Show info for a server",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "bot",
      description: "Show info for the bot",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: async ({ client, interaction }) => {
    await ownerCheck(interaction);
    if (interaction.replied) return;

    if (interaction.options.getSubcommand() === "user") {
      const member = interaction.options.getMember("user") as GuildMember;
      const res = await axios.get(
        `https://discord.com/api/v9/users/${member.id}`,
        {
          headers: {
            Authorization: `Bot ${client.token}`,
          },
        }
      );
      const { banner, accent_color } = res.data;
      if (banner) {
        const extension = banner.startsWith("a_") ? ".gif" : ".png";
        const url = `https://cdn.discordapp.com/banners/${member.id}/${banner}${extension}`;
        const embed = new EmbedBuilder()
          .setAuthor({
            name: member.user.tag,
            iconURL: member.user.displayAvatarURL({
              forceStatic: true,
              extension: "png",
              size: 1024,
            }),
          })
          .setColor(member.displayHexColor)
          .addFields(
            {
              name: "id",
              value: `${member.id}`,
              inline: true,
            },
            {
              name: "Account Created",
              value: `<t:${Math.round(
                member.user.createdTimestamp / 1000
              )}:F> - <t:${Math.round(member.user.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            {
              name: "Joined Server",
              value: `<t:${Math.round(
                member.joinedTimestamp / 1000
              )}:F> - <t:${Math.round(member.joinedTimestamp / 1000)}:R>`,
            },
            {
              name: "Roles",
              value:
                `${member.roles.cache
                  .map((role) => role.toString())
                  .join(",\n")
                  .slice(0, -11)}` || "None",
              inline: true,
            }
          )
          .setImage(url);
        interaction.reply({ embeds: [embed] });
      } else {
        if (accent_color) {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: member.user.tag,
              iconURL: member.user.displayAvatarURL({
                forceStatic: true,
                extension: "png",
                size: 1024,
              }),
            })
            .setColor(accent_color)
            .addFields(
              {
                name: "id",
                value: `${member.id}`,
                inline: true,
              },
              {
                name: "Account Created",
                value: `<t:${Math.round(
                  member.user.createdTimestamp / 1000
                )}:F> - <t:${Math.round(
                  member.user.createdTimestamp / 1000
                )}:R>`,
                inline: true,
              },
              {
                name: "Joined Server",
                value: `<t:${Math.round(
                  member.joinedTimestamp / 1000
                )}:F> - <t:${Math.round(member.joinedTimestamp / 1000)}:R>`,
              },
              {
                name: "Roles",
                value:
                  `${member.roles.cache
                    .map((role) => role.toString())
                    .join(",\n")
                    .slice(0, -11)}` || "None",
                inline: true,
              }
            )
            .setImage(
              member.displayAvatarURL({
                forceStatic: true,
                extension: "png",
                size: 1024,
              })
            );
          interaction.reply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: member.user.tag,
              iconURL: member.displayAvatarURL({
                forceStatic: true,
                extension: "png",
                size: 1024,
              }),
            })
            .setColor(member.displayHexColor)
            .addFields(
              {
                name: "id",
                value: `${member.id}`,
                inline: true,
              },
              {
                name: "Account Created",
                value: `<t:${Math.round(
                  member.user.createdTimestamp / 1000
                )}:F> - <t:${Math.round(
                  member.user.createdTimestamp / 1000
                )}:R>`,
                inline: true,
              },
              {
                name: "Joined Server",
                // @ts-ignore
                value: `<t:${Math.round(
                  //@ts-ignore
                  member.joinedTimestamp / 1000
                )}:F>`,
                inline: true,
              },
              {
                name: "Roles",
                value:
                  `${member.roles.cache
                    .map((role) => role.toString())
                    .join(",\n")
                    .slice(0, -11)}` || "None",
                inline: true,
              }
            )
            .setImage(
              member.user.displayAvatarURL({
                forceStatic: true,
                extension: "png",
                size: 1024,
              })
            );
          interaction.reply({ embeds: [embed] });
        }
      }
    } else if (interaction.options.getSubcommand() === "channel") {
      const channel = interaction.options.getChannel("ch") as GuildChannel;
      if (channel === null) return console.log("Channel is null");
      const channelEmbed = new EmbedBuilder()
        .setAuthor({ name: channel.name })
        .setColor(Colors.White)
        .addFields(
          {
            name: "id",
            value: `${channel.id}`,
            inline: true,
          },
          {
            name: "Created",
            value: `<t:${Math.round(
              channel.createdTimestamp / 1000
            )}:F> - <t:${Math.round(channel.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "type",
            value: `${channel.type}`,
            inline: true,
          },
          {
            name: "Deletable",
            value: `${channel.deletable ? "Yes" : "No"}`,
            inline: true,
          }
        );
      interaction.reply({ embeds: [channelEmbed] });
    } else if (interaction.options.getSubcommand() === "role") {
      const role = interaction.options.getRole("r") as Role;
      if (role === null) return console.log("role is null");
      const roleEmbed = new EmbedBuilder()
        .setAuthor({ name: role.name })
        .setColor(role.color)
        .addFields(
          {
            name: "id",
            value: `${role.id}`,
            inline: true,
          },
          {
            name: "Created",
            value: `<t:${Math.round(
              role.createdTimestamp / 1000
            )}:F> - <t:${Math.round(role.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Hoisted",
            value: `${role.hoist ? "Yes" : "No"}`,
            inline: true,
          },
          {
            name: "Mentionable",
            value: `${role.mentionable ? "Yes" : "No"}`,
            inline: true,
          },
          {
            name: "Managed",
            value: `${role.managed ? "Yes" : "No"}`,
            inline: true,
          },
          {
            name: "Position",
            value: `${role.position}`,
          },
          {
            name: "Members",
            value: `${role.members.size} members`,
            inline: true,
          }
        );
      interaction.reply({ embeds: [roleEmbed] });
    } else if (interaction.options.getSubcommand() == "server") {
      const members = await interaction.guild.members.fetch();
      const owner = await interaction.guild.fetchOwner();
      const server = interaction.guild;
      const serverEmbed = new EmbedBuilder()
        .setAuthor({ name: server.name })
        .setColor(Colors.White)
        .addFields(
          {
            name: "id",
            value: `${server.id}`,
            inline: true,
          },
          {
            name: "Created",
            value: `<t:${Math.round(
              server.createdTimestamp / 1000
            )}:F> - <t:${Math.round(server.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Owner",
            value: `${owner.user.tag} (${owner.id})`,
            inline: true,
          },
          {
            name: "Verification Level",
            value: `${server.verificationLevel}`,
            inline: true,
          },
          {
            name: "Approx. Member Count",
            value: `${server.approximateMemberCount}`,
            inline: true,
          },
          {
            name: "Approx. Presence Count",
            value: `${server.approximatePresenceCount}`,
            inline: true,
          },
          {
            name: "Commands",
            value: `${server.commands.cache.size} commands`,
            inline: true,
          },
          {
            name: "Role Count",
            value: `${server.roles.cache.size} roles`,
            inline: true,
          },
          {
            name: "Channel Count",
            value: `${server.channels.cache.size} channels`,
            inline: true,
          },
          {
            name: "Members",
            value: `${server.memberCount} members`,
            inline: true,
          },
          {
            name: "Bots",
            value: `${members.filter((m) => m.user.bot).size} bots`,
            inline: true,
          },
          {
            name: "Humans",
            value: `${members.filter((m) => !m.user.bot).size} humans`,
            inline: true,
          }
        );
      interaction.reply({ embeds: [serverEmbed] });
    } else if (interaction.options.getSubcommand() === "bot") {
      const type = client.user.presence.activities[0].type;
      const bot = interaction.guild.members.me;
      const botEmbed = new EmbedBuilder()
        .setAuthor({ name: client.user.tag })
        .setColor(client.user.accentColor)
        .addFields(
          {
            name: "id",
            value: `${client.user.id}`,
            inline: true,
          },
          {
            name: "Created",
            value: `<t:${Math.round(
              client.user.createdTimestamp / 1000
            )}:F> - <t:${Math.round(client.user.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Joined",
            value: `<t:${Math.round(
              bot.joinedTimestamp / 1000
            )}:F> - <t:${Math.round(bot.joinedTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Status",
            value: `${client.user.presence.status}`,
            inline: true,
          },
          {
            name: "Activity",
            value: `${
              client.user.presence.activities.length > 0
                ? `${
                    type.toString().charAt(0).toUpperCase() +
                    type.toString().slice(1)
                  } **${client.user.presence.activities[0].name}**`
                : "None"
            }`,
            inline: true,
          }
        );
      interaction.reply({ embeds: [botEmbed], ephemeral: true });
    }
  },
});
