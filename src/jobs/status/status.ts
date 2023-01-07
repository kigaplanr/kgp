import { EmbedBuilder, TextChannel } from "discord.js";
import cron from "node-cron";
import { client } from "../../";

import emojis from "../../styles/emojis";

export async function serverStatus() {
  const channel = client.channels.cache.get(
    process.env.STATUS_CHANNEL
  ) as TextChannel;
  const message = await channel.messages.fetch(process.env.STATUS_MESSAGE);
  const guild = process.env.GUILD_ID;

  if (!message) return;

  const guildMembers = await (
    await client.guilds.fetch(guild)
  )?.members.fetch();
  const totalOnline = await (
    await guildMembers
  ).filter((member) => member.presence?.status === "online");

  // get the amount of members that have the process.env.VERIFIED_ROLE role
  const verifiedMembers = client.guilds.cache
    .get(guild)
    ?.roles.cache.get(process.env.VERIFIED_ROLE)?.members.size;
  const memberCount = client.guilds.cache.get(guild)?.memberCount;

  cron.schedule("*/60 * * * * *", async () => {
    const serverEmbed = new EmbedBuilder()
      .addFields([
        {
          name: `${emojis.online} Online`,
          value: `${totalOnline?.size}`,
          inline: true,
        },
        {
          name: `${emojis.users} Mitglieder`,
          value: `${memberCount}`,
          inline: true,
        },
        {
          name: `${emojis.review} Verifizierte Mitglieder`,
          value: `${verifiedMembers}`,
          inline: true,
        },
      ])
      .setFooter({ text: `Letztes Update: ${new Date().toLocaleString()}` });
    await message.edit({ embeds: [serverEmbed] });
  });
}
