import { EmbedBuilder, TextChannel } from "discord.js";
import cron from "node-cron";
import { client } from "..";

import { checkIfEnabled, checkIsHoliday } from "./KigaPostCheck";

export async function sendKigaStart() {
  const channel = (await client.channels.fetch(
    process.env.KIGA_CHANNEL
  )) as TextChannel;
  const embed = new EmbedBuilder()
    .setDescription(
      `Guten Morgeeeeen! ☕️\n\nWir wünschen euch einen schönen Praxis- bzw. Schultag 😎`
    )
    .setColor("Random")
    .setFooter({
      text: "BAfEP | Automatisierte Nachricht",
      iconURL: client.user?.displayAvatarURL(),
    });

  cron.schedule(
    "0 7 * * MON-FRI",
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
