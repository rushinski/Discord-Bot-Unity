/**
 * File: RegisterCommands.js
 * Purpose: Register all slash commands with the Discord API.
 *
 * Responsibilities:
 * - Collect loaded commands from the client.
 * - Convert them to the required JSON format.
 * - Send them to Discord for registration via REST API.
 *
 * Notes for Recruiters:
 * This step makes slash commands available to users in Discord.
 * Without registration, commands cannot be executed.
 */

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = async function RegisterCommands(client) {
  console.log('[RegisterCommands] Starting command registration...');

  const commands = [];

  for (const [, command] of client.commands) {
    try {
      commands.push(command.data.toJSON());
    } catch (err) {
      console.error(
        `[RegisterCommands] Failed to parse command "${command?.data?.name || 'unknown'}":`,
        err.message
      );
    }
  }

  if (!commands.length) {
    console.warn('[RegisterCommands] No commands found to register.');
    return;
  }

  try {
    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);

    await rest.put(
      Routes.applicationCommands(client.config.APP_ID),
      { body: commands }
    );

    console.log(`[RegisterCommands] Successfully registered ${commands.length} command(s).`);
  } catch (err) {
    console.error('[RegisterCommands] Failed to register commands with Discord API:', err.message);
  }
};
