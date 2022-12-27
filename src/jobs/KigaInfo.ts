import { EmbedBuilder, TextChannel } from "discord.js";
import cron from "node-cron";
import { client } from "..";
import { checkIfEnabled, checkIsHoliday } from "./KigaPostCheck";

export async function sendKigaInfo() {
  const channel = (await client.channels.fetch(
    process.env.KIGA_CHANNEL
  )) as TextChannel;

  const embed = new EmbedBuilder()
    .setDescription(
      `Liebe SchülerInnen :wave:\nMorgen heißt es wieder: Neue Woche - neues Glück :tada:\n\nVergesst eure Praxismappe, die Medien für eure Bildungsangebote und natürlich eure Lieder und Fingerspiele nicht!\nWir wünschen euch einen guten Start in die neue Woche :heart:`
    )
    .setColor("Random")
    .setFooter({
      text: "BAfEP | Automatisierte Nachricht",
      iconURL: client.user?.displayAvatarURL(),
    });
  cron.schedule(
    "0 16 * * SUN",
    async () => {
      const isEnabled = await checkIfEnabled();
      const isHoliday = await checkIsHoliday();
      if (!isEnabled || isHoliday) return;
      await channel.send({ embeds: [embed] });
    },
    {
      scheduled: true,
      timezone: "Europe/Berlin",
    }
  );
}
