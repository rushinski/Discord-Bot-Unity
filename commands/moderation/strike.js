/**
 * Slash Command: /strike
 * ----------------------------------------
 * Issues a strike to a user. 
 * - Each strike is stored in the Infractions schema.
 * - Accumulating 3 strikes results in an automatic ban.
 *
 * Example:
 *   /strike target:@username
 *
 * Notes:
 * - Requires the "Ban Members" permission.
 * - Strikes reset after the user is banned.
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Infractions = require('../../schemas/infractions');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('strike')
    .setDescription('Give a user a strike (3 strikes = ban).')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The user to give a strike to')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const guild = interaction.guild;
    const guildId = guild.id;

    try {
      // ✅ Ensure the bot has permission
      if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: '⚠️ I do not have permission to ban members.',
          flags: 64,
        });
      }

      // ✅ Find or create user infraction record
      let infraction = await Infractions.findOne({ userId: target.id, guildId });
      if (!infraction) {
        infraction = new Infractions({ userId: target.id, guildId, strikes: 0 });
      }

      // ✅ Increment strikes
      infraction.strikes += 1;
      await infraction.save();

      // ✅ Handle auto-ban on 3rd strike
      if (infraction.strikes >= 3) {
        const member = await guild.members.fetch(target.id).catch(() => null);

        if (member) {
          await member.ban({ reason: 'Accumulated 3 strikes.' });
          await interaction.reply({
            content: `🔨 ${target.tag} has been banned for accumulating **3 strikes**.`,
          });
        } else {
          await interaction.reply({
            content: '⚠️ User not found in the server.',
            flags: 64,
          });
        }

        // Reset infractions after ban
        await Infractions.deleteOne({ userId: target.id, guildId });
      } else {
        await interaction.reply({
          content: `⚠️ ${target.tag} now has **${infraction.strikes}** strike(s).`,
        });
      }
    } catch (error) {
      console.error('❌ Error in /strike command:', error);
      return interaction.reply({
        content: '❌ An unexpected error occurred while processing the strike.',
        flags: 64,
      });
    }
  },
};
