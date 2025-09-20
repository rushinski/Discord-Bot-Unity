/**
 * Command: /strike
 *
 * Purpose:
 * Allow administrators to issue a strike to a user. Strikes are tracked
 * in the Infractions schema and escalate to a ban after three total strikes.
 *
 * Responsibilities:
 * - Verify that the invoking user and bot both have "Ban Members" permission.
 * - Increment the strike count for the targeted user.
 * - Automatically ban users who accumulate three strikes.
 * - Reset user infractions after a ban to maintain consistency.
 *
 * Recruiter Notes:
 * This command shows how disciplinary rules can be enforced consistently
 * through database persistence. It ensures accountability while
 * protecting the community with automated escalation.
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Infractions = require('../../schemas/infractions');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('strike')
    .setDescription('Issue a strike to a user (three strikes result in a ban).')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The user to give a strike to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const guild = interaction.guild;
    const guildId = guild.id;

    try {
      // Ensure the bot has the required permission.
      if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: 'The bot does not have permission to ban members in this server.',
          flags: 64, // Ephemeral reply
        });
      }

      // Retrieve or initialize the user's infractions record.
      let infraction = await Infractions.findOne({ userId: target.id, guildId });
      if (!infraction) {
        infraction = new Infractions({ userId: target.id, guildId, strikes: 0, warnings: 0 });
      }

      // Increment strike count.
      infraction.strikes += 1;
      await infraction.save();

      // Handle automatic ban if the user has reached three strikes.
      if (infraction.strikes >= 3) {
        const member = await guild.members.fetch(target.id).catch(() => null);

        if (member) {
          await member.ban({ reason: 'User accumulated three strikes.' });

          await interaction.reply({
            content: `${target.tag} has been banned for accumulating three strikes.`,
          });
        } else {
          await interaction.reply({
            content: 'The specified user could not be found in this server.',
            flags: 64, // Ephemeral reply
          });
        }

        // Reset infractions record after ban.
        await Infractions.deleteOne({ userId: target.id, guildId });
      } else {
        // Notify how many strikes the user currently has.
        await interaction.reply({
          content: `${target.tag} now has ${infraction.strikes} strike(s).`,
        });
      }
    } catch (error) {
      console.error('[Moderation:strike] Error executing command:', error);

      return interaction.reply({
        content: 'An error occurred while processing the strike command. Please try again later.',
        flags: 64, // Ephemeral reply
      });
    }
  },
};
