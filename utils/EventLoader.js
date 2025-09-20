/**
 * File: EventLoader.js
 * Purpose: Loads and registers event handlers for the bot.
 *
 * Responsibilities:
 * - Read the `events` directory and require each event module.
 * - Validate that events export the expected structure.
 * - Register handlers onto the Discord client.
 *
 * Notes for Recruiters:
 * Events are system hooks (e.g., message received, user joined).
 * This loader ensures each event is automatically bound to the client.
 */

const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');

module.exports = function EventLoader(client) {
  const eventsDir = path.join(__dirname, '../events');

  if (!fs.existsSync(eventsDir)) {
    console.warn('[EventLoader] Events directory does not exist.');
    return;
  }

  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
  if (!eventFiles.length) {
    console.warn('[EventLoader] No event files found.');
    return;
  }

  let loadedCount = 0;

  for (const file of eventFiles) {
    const filePath = path.join(eventsDir, file);
    let event;

    try {
      event = require(filePath);
    } catch (err) {
      console.error(`[EventLoader] Failed to require ./${file}:`, err.message);
      continue;
    }

    if (typeof event.name !== 'string' || typeof event.execute !== 'function') {
      console.warn(`[EventLoader] Skipping ${file}: missing valid name or execute function.`);
      continue;
    }

    const eventName = Events[event.name] || event.name;

    if (!Object.values(Events).includes(eventName) && !Object.keys(Events).includes(eventName)) {
      console.warn(`[EventLoader] Invalid event name "${event.name}" in ${file}.`);
      continue;
    }

    try {
      client[event.once ? 'once' : 'on'](eventName, (...args) => event.execute(...args));
      console.log(`[EventLoader] Loaded event: ${event.name}`);
      loadedCount++;
    } catch (err) {
      console.error(`[EventLoader] Error loading event "${event.name}":`, err.message);
    }
  }

  console.log(`[EventLoader] ${loadedCount} events loaded.`);
};
