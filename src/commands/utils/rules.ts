import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { ownerCheck } from "../../guards/owner";
import { Command } from "../../structures/Command";

export default new Command({
  name: "rules",
  description: "Regeln lol",
  userPermissions: [PermissionFlagsBits.Administrator],
  run: async ({ interaction, client }) => {
    await ownerCheck(interaction);
    if (interaction.replied) return;

    const channel = interaction.channel;
    const embed = new EmbedBuilder()
      .setTitle("Regeln - BAfEP")
      .setDescription(
        `
    1. Keine NSFW-Inhalte jeglicher Art.
    Nur Deutsch in jedem Chat / Sprachkanal.

    2. Keine Werbung.
       a. Sie dürfen nur Selbstwerbung senden, wenn andere Mitglieder danach fragen. Servereinladungen sind strengstens untersagt - das Beitreten von ihnen und die Unterstützung führen zu einem Verbot.

    3. Keine verdächtigen URLs jeglicher Art.
       a. Werbung für andere Discord-Server außer Partnern mit ihrem Link, Namen usw. ist in diesem Fall nicht erlaubt.

    4. Kein sozial unakzeptables Verhalten, Hassrede, Diskriminierung, Meinungsstreitigkeiten, etc.
       Respektiere jeden. Wir sind eine Gemeinschaft, jeder zählt genauso viel.

    5. Befolge die Discord Nutzungsbedingungen (https://dis.gd/tos) und Richtlinien (https://dis.gd/).

    6. Verwende gesunden Menschenverstand. Wenn du zweimal darüber nachdenken musst, ob du etwas tun sollst oder nicht. Oder du bist dir nicht sicher, ob es in Ordnung ist, etwas zu tun. Tu es nicht.

    7. Versuche nicht, die Regeln in irgendeiner Form zu biegen.

    8. Kein Spamming/Flooding. Dazu gehört unter anderem:
        a. Das Senden von (gleichen) Nachrichten in schneller Folge.
        b. Eine Textwand.
        c. Großbuchstaben-Nachrichten/Betrugslinks.

    9. Gib keine privaten Informationen über andere Personen weiter. Du darfst nicht-sensible Informationen über dich selbst teilen, aber bitte stelle sicher, dass du dich dabei wohl fühlst. (Nicht-sensibel beinhaltet Dinge wie deinen echten Vornamen und ein Bild von deinem Gesicht. Sensibel beinhaltet Dinge wie deine Sozialversicherungsnummer, Zahlungsinformationen, Adresse usw.)

    10. Der Verkauf, die Weitergabe oder das Verschenken von Konten jeglicher Art ist strengstens untersagt.

    11. Spamming ist keine gute Art, in Kanälen zu sprechen, jedoch führen diese Situationen wahrscheinlich zu einer temporären Stummschaltung.

    12. Anti-Nutzungsbedingungen-Profilbilder (NSFW) / Nicknamen / Benutzernamen, die illegal sind oder nicht gut ausgesprochen werden können, sind nicht erlaubt und führen zu einer Änderung des Spitznamens ink. Verwarnung.

    Moderatoren können die ihnen angemessene Strafe verhängen.
    Ich behalte mir das Recht vor, eine Bestrafung zu verhängen, unabhängig davon, ob gegen die Regeln verstoßen wurde oder nicht. Eine Umgehung führt zu einem Verbot des Servers.
    Ungewissheit schützt nicht vor einer Strafe.
    `
      )
      .setColor("Random")
      .setTimestamp();

    channel.send({ embeds: [embed] });

    interaction.reply({
      content: "Done!",
      ephemeral: true,
    });
  },
});
