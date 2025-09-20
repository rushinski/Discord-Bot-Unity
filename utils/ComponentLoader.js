/**
 * File: ComponentLoader.js
 * Purpose: Dynamically loads bot components (commands, modals).
 *
 * Responsibilities:
 * - Validate exported structures before loading.
 * - Map components into the client instance.
 * - Provide structured logs of what was successfully loaded.
 *
 * Notes for Recruiters:
 * This module ensures commands and modals are discovered
 * automatically from the filesystem and made available to the bot.
 */

const { existsSync } = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');
const ReadFolder = require('./ReadFolder');

const MODULES = ['commands', 'modals'];

module.exports = function ComponentLoader(client) {
  for (const module of MODULES) {
    client[module] = new Map();

    if (!existsSync(`${__dirname}/../${module}`)) {
      console.warn(`[ComponentLoader] Skipping missing folder: ${module}`);
      continue;
    }

    const files = ReadFolder(module);

    for (const { path, data } of files) {
      try {
        if (typeof data.execute !== 'function') {
          throw new Error('Missing or invalid execute function');
        }

        if (module === 'commands') {
          if (!(data.data instanceof SlashCommandBuilder)) {
            throw new Error('Invalid command: must export a SlashCommandBuilder');
          }
          client[module].set(data.data.name, data);
        } else {
          if (!data.customID || typeof data.customID !== 'string') {
            throw new Error('Invalid component: missing or invalid customID');
          }
          client[module].set(data.customID, data);
        }

        console.log(`[ComponentLoader] Loaded ${module.slice(0, -1)}: ./${path}`);
      } catch (error) {
        console.error(`[ComponentLoader] Failed to load ./${path} (${module}):`, error.message);
      }
    }

    console.log(`[ComponentLoader] ${client[module].size} ${module} loaded.`);
  }
};
