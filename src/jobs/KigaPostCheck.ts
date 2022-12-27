import { client } from "..";
import KigaPost from "../models/guild/kigapost";

export async function checkIfEnabled() {
  const clientGuild = client.guilds.cache.get(process.env.GUILD_ID);
  const guildQuery = await KigaPost.findOne({
    guildID: clientGuild.id,
  });

  const isEnabled = guildQuery.enabled;
  return isEnabled;
}

export async function checkIsHoliday() {
  const clientGuild = client.guilds.cache.get(process.env.GUILD_ID);
  const guildQuery = await KigaPost.findOne({
    guildID: clientGuild.id,
  });

  const isHoliday = guildQuery.holiday;
  return isHoliday;
}
