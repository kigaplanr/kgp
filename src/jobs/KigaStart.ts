import { EmbedBuilder, TextChannel } from "discord.js";
import cron from "node-cron";
import { client } from "..";

export async function sendKigaStart() {
  const channel = (await client.channels.fetch(
    process.env.KIGA_CHANNEL
  )) as TextChannel;
  const embed = new EmbedBuilder()
    .setDescription(
      `Guten Morgeeeeen! ☕️\n\nWir schönen euch einen schönen Praxis- bzw. Schultag 😎`
    )
    .setColor("Random")
    .setFooter({
      text: "BAfEP | Automatisierte Nachricht",
      iconURL: client.user?.displayAvatarURL(),
    });

  cron.schedule(
    "0 7 * * MON-FRI",
    async () => {
      await channel.send({ embeds: [embed] });
    },
    {
      scheduled: true,
      timezone: "Europe/Berlin",
    }
  );
}
