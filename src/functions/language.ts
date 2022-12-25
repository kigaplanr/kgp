import { Interaction, Message } from "discord.js";

/**
 * Grabs the user's language code from an interaction, falls back to the
 * guild language code, then falls back to en-GB.
 *
 * @param {Interaction} source The interaction to grab the language code from.
 * @returns {string} The language code.
 */
export const getInteractionLanguage = (source: Interaction) => {
  if (source.locale) {
    return source.locale;
  }
  if (source.guildLocale) {
    return source.guildLocale;
  }
  return "en-US";
};

/**
 * Grabs the guild language code from the message, falls back to en-GB.
 *
 * @param {Message} source The message to grab the language code from.
 * @returns {string} The language code.
 */
export const getMessageLanguage = (source: Message) => {
  if (source.guild?.preferredLocale) {
    return source.guild.preferredLocale;
  }
  return "en-US";
};
