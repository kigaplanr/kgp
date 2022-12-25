import { EmbedBuilder, TextChannel } from "discord.js";
import cron from "node-cron";
import { client } from "..";

export async function sendKigaEnd() {
  const channel = (await client.channels.fetch(
    process.env.KIGA_CHANNEL
  )) as TextChannel;
  const embed = new EmbedBuilder()
    .setDescription(
      `Mahlzeit! 🍝\n\nWir wünschen euch eine schöne Mittagspause oder einen schönen Ausklang des Praxistages 😎\n\nPS: Nicht auf die Reflexionen vergessen 😉`
    )
    .setColor("Random")
    .setFooter({
      text: "BAfEP | Automatisierte Nachricht",
      iconURL: client.user?.displayAvatarURL(),
    });

  cron.schedule(
    "0 13 * * MON-FRI",
    async () => {
      await channel.send({ embeds: [embed] });
    },
    {
      scheduled: true,
      timezone: "Europe/Berlin",
    }
  );
}
