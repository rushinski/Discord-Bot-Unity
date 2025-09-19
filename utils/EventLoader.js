/**
 * Utility: EventLoader
 * ----------------------------------------
 * Dynamically loads event handlers from the events folder
 * and registers them to the client instance.
 *
 * Notes:
 * - Supports both `once` and `on` event bindings.
 * - Validates event structure before loading.
 * - Provides structured logs for successes and failures.
 */

const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');

module.exports = function EventLoader(client) {
  const eventsDir = path.join(__dirname, '../events');

  if (!fs.existsSync(eventsDir)) {
    console.warn('[EventLoader] ⚠️ Events directory does not exist.');
    return;
  }

  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
  if (!eventFiles.length) {
    console.warn('[EventLoader] ⚠️ No event files found.');
    return;
  }

  let loadedCount = 0;

  for (const file of eventFiles) {
    const filePath = path.join(eventsDir, file);
    let event;

    try {
      event = require(filePath);
    } catch (err) {
      console.error(`[EventLoader] ❌ Failed to require ./${file}:`, err.message);
      continue;
    }

    if (typeof event.name !== 'string' || typeof event.execute !== 'function') {
      console.warn(`[EventLoader] ⚠️ Skipping ${file}: missing valid name or execute function.`);
      continue;
    }

    const eventName = Events[event.name] || event.name;

    if (!Object.values(Events).includes(eventName) && !Object.keys(Events).includes(eventName)) {
      console.warn(`[EventLoader] ⚠️ Invalid event name "${event.name}" in ${file}.`);
      continue;
    }

    try {
      client[event.once ? 'once' : 'on'](eventName, (...args) => event.execute(...args));
      console.log(`[EventLoader] ✅ Loaded event: ${event.name}`);
      loadedCount++;
    } catch (err) {
      console.error(`[EventLoader] ❌ Error loading event "${event.name}":`, err.message);
    }
  }

  console.log(`[EventLoader] 📦 ${loadedCount} events loaded.`);
};
