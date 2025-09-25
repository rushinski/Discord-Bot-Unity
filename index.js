/**
 * File: index.js
 * Purpose: Entry point for the Discord bot application.
 *
 * Responsibilities:
 * - Initialize Discord client with required intents.
 * - Load modular components and event handlers.
 * - Register slash commands with the Discord API.
 * - Handle user interactions (commands, modals).
 *
 * Notes for Recruiters:
 * This is the bootstrap script that sets up the bot runtime,
 * loads supporting modules, and connects to Discord.
 */

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// Initialize client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

client.config = require('./config.json');
client.cooldowns = new Map();
client.cache = new Map();

// Load supporting utilities
require('./utils/componentLoader')(client);
require('./utils/eventLoader')(client);

// Register slash commands with Discord
(async () => {
  try {
    const registerCommands = require('./utils/registerCommands');
    await registerCommands(client);
  } catch (err) {
    console.error('[Startup] Failed to register commands:', err.message);
  }
})();

console.log('[Startup] Starting login sequence...');
client.login(client.config.TOKEN);

// Confirm when client is ready
client.once('clientReady', () => {
  console.log(`[Startup] Client logged in as ${client.user.tag}`);
});

/**
 * Handles user interactions such as commands and modals.
 * @param {object} interaction - Discord interaction object.
 * @param {string} type - The type of component to resolve (commands, modals).
 */
async function handleInteraction(interaction, type) {
  const key = interaction.customId ?? interaction.commandName;
  const component = client[type]?.get(key);

  if (!component) return;

  try {
    // Permission checks
    if (component.admin && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'Only administrators can use this command.',
        ephemeral: true,
      });
    }

    if (component.owner && interaction.user.id !== client.config.OWNER_ID) {
      return interaction.reply({
        content: 'Only the bot owner can use this command.',
        ephemeral: true,
      });
    }

    await component.execute(interaction, client);
  } catch (error) {
    console.error('[InteractionHandler] Error executing component:', error);
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while executing this interaction.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while executing this interaction.',
        });
      }
    } catch (replyError) {
      console.error('[InteractionHandler] Failed to send error response:', replyError.message);
    }
  }
}

// Centralized interaction listener
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) return handleInteraction(interaction, 'commands');
  if (interaction.isModalSubmit()) return handleInteraction(interaction, 'modals');
});
