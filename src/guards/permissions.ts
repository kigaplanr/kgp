import {
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";

export function isOwner(interaction: CommandInteraction): boolean {
  return interaction.user.id === interaction.guild.ownerId;
}

export function isAdmin(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

// Members

export function canBanMembers(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.BanMembers);
}

export function canKickMembers(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.KickMembers);
}

export function canManageNicknames(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageNicknames);
}

export function canDeleteMessages(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageMessages);
}

export function canAddReactions(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.AddReactions);
}

export function canReadHistory(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ReadMessageHistory);
}

export function canSendMessages(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.SendMessages);
}

// Manage

export function canManageRoles(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageRoles);
}

export function canManageChannels(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageChannels);
}

export function canManageGuild(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageGuild);
}

export function canManageEmojis(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers);
}

export function canManageWebhooks(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageWebhooks);
}

export function canManageThreads(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageThreads);
}

export function canManageEvents(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageEvents);
}

// Voice

export function canDeafen(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.DeafenMembers);
}
