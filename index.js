/**
 * Entry Point: index.js
 * ----------------------------------------
 * Bootstraps the Discord bot:
 * - Initializes client with required intents
 * - Loads components, events, and commands
 * - Registers commands with Discord API
 * - Handles interactions (commands, buttons, dropdowns, modals)
 */

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// Client initialization
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

// Load utilities (camelCase filenames)
require('./utils/componentLoader')(client);
require('./utils/eventLoader')(client);

// Register slash commands with Discord
(async () => {
  try {
    const registerCommands = require('./utils/registerCommands');
    await registerCommands(client);
  } catch (err) {
    console.error('[Startup] ❌ Failed to register commands:', err.message);
  }
})();

console.log('[Startup] 🔑 Logging in...');
client.login(client.config.TOKEN);

client.once('clientReady', () => {
  console.log(`[Startup] ✅ Logged in as ${client.user.tag}`);
});

// -----------------------------
// Interaction Dispatcher
// -----------------------------
async function handleInteraction(interaction, type) {
  const key = interaction.customId ?? interaction.commandName;
  const component = client[type]?.get(key);

  if (!component) return;

  try {
    // Permission checks
    if (component.admin && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '⚠️ Only administrators can use this command!',
        ephemeral: true,
      });
    }

    if (component.owner && interaction.user.id !== client.config.OWNER_ID) {
      return interaction.reply({
        content: '⚠️ Only the bot owner can use this command!',
        ephemeral: true,
      });
    }

    await component.execute(interaction, client);
  } catch (error) {
    console.error('[InteractionHandler] ❌ Error executing component:', error);
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while executing this interaction.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: '❌ An error occurred while executing this interaction.',
        });
      }
    } catch {
      // swallow reply errors
    }
  }
}

// Centralized interaction handling
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) return handleInteraction(interaction, 'commands');
  if (interaction.isModalSubmit()) return handleInteraction(interaction, 'modals');
});
