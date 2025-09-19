/**
 * File: utils/githubGistUtils.js
 * Purpose: Provides utility for generating and uploading ticket transcripts to GitHub Gist.
 * Notes:
 * - Reads Gist API token from config.json (key: "GIST_TOKEN").
 * - Formats messages into plain text logs.
 * - Uploads transcript to GitHub Gist when possible.
 * - Returns Gist URL or null if upload fails.
 */

const { GIST_TOKEN } = require('../config.json');

/**
 * Formats messages into a plain text transcript.
 */
function formatTranscript(messages, channel) {
  return messages
    .map(
      msg =>
        `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content || '[Embed/Attachment]'}`
    )
    .join('\n');
}

/**
 * Uploads transcript to GitHub Gist.
 * 
 * @param {Array} messages - Array of Discord messages.
 * @param {Object} channel - Discord channel object (for naming).
 * @param {Object} guildConfig - Guild configuration (for context).
 * @returns {string|null} Gist URL or null on failure.
 */
async function uploadTranscript(messages, channel, guildConfig) {
  try {
    if (!GIST_TOKEN) {
      console.warn('[Transcript] No GIST_TOKEN found in config.json. Skipping Gist upload.');
      return null;
    }

    const transcriptContent = formatTranscript(messages, channel);

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Transcript for ticket ${channel.name} in guild ${channel.guild.id}`,
        public: false,
        files: {
          [`${channel.name}-transcript.txt`]: {
            content: transcriptContent,
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('[Transcript] Failed to upload transcript:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log(`[Transcript] Uploaded to Gist: ${data.html_url}`);
    return data.html_url;
  } catch (error) {
    console.error('[Transcript] Error uploading transcript:', error);
    return null;
  }
}

module.exports = uploadTranscript;
