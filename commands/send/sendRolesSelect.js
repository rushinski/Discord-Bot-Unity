/**
 * Command: /send-role-select
 *
 * Purpose:
 * Deploys role selection embeds for the current guild. This ensures
 * members can assign themselves roles by reacting to the configured
 * emojis on the embed.
 *
 * Responsibilities:
 * - Remove previously deployed role selection messages to prevent duplicates.
 * - Construct embeds based on saved configuration from the database.
 * - Send new embeds into the target channel and apply emoji reactions.
 * - Update the database with the new message IDs for accurate tracking.
 *
 * Recruiter Notes:
 * This command demonstrates structured configuration management and
 * clean handling of automated message deployment. Old messages are
 * properly cleaned, database state is updated, and all errors are logged
 * without disrupting bot stability.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleReactionMessage = require('../../schemas/roleReactionMessage');

module.exports = {
  admin: true,

  data: new SlashCommandBuilder()
    .setName('send-role-select')
    .setDescription('Deploys the configured role selection embeds.'),

  /**
   * Execute the send-role-select command.
   * @param {object} interaction - The Discord interaction object.
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const configs = await RoleReactionMessage.find({ guildId: interaction.guild.id });

      if (!configs.length) {
        await interaction.editReply({
          content: 'No role configurations found. Please configure roles before using this command.',
          flags: 64,
        });
        return;
      }

      for (const config of configs) {
        // Remove previously sent role selection message, if it exists
        if (config.messageId) {
          try {
            const channel = await interaction.guild.channels.fetch(config.channelId);
            if (channel) {
              const oldMessage = await channel.messages.fetch(config.messageId).catch(() => null);
              if (oldMessage) await oldMessage.delete();
            }
          } catch (err) {
            console.warn(`[RoleSystem] Failed to remove old message for type "${config.messageType}": ${err.message}`);
          }
        }

        // Build the embed for role selection
        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle(`Select your ${config.messageType}`)
          .setDescription(
            `${config.description}\n\n${config.roles
              .map(r => `${r.emoji} | ${r.roleName}`)
              .join('\n')}`
          )
          .setFooter({ text: 'React to this message to assign yourself a role.' })
          .setTimestamp();

        // Send the embed
        const message = await interaction.channel.send({ embeds: [embed] });

        // Update database with new message details
        config.messageId = message.id;
        config.channelId = interaction.channel.id;
        await config.save();

        // Apply emoji reactions for each configured role
        for (const r of config.roles) {
          try {
            await message.react(r.emoji);
          } catch (err) {
            console.error(`[RoleSystem] Failed to apply reaction "${r.emoji}" in guild ${interaction.guild.id}: ${err.message}`);
          }
        }
      }

      await interaction.editReply({
        content: 'Role selection embeds have been deployed successfully.',
        flags: 64,
      });
    } catch (error) {
      console.error(`[RoleSystem] Error while deploying role selection embeds in guild ${interaction.guild?.id}:`, error);

      await interaction.editReply({
        content: 'An error occurred while attempting to send role selection embeds.',
        flags: 64,
      });
    }
  },
};
