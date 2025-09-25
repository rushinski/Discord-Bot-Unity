/**
 * File: utils/githubGistUtils.js
 * Purpose: Provides utilities for generating and uploading ticket transcripts to GitHub Gist.
 *
 * Responsibilities:
 * - Format Discord messages into a plain text transcript.
 * - Upload transcripts to GitHub Gist using the provided API token.
 * - Return a Gist URL if successful, or null if upload fails.
 * - Provide a fallback path when transcripts cannot be uploaded.
 *
 * Notes for Recruiters:
 * This utility ensures tickets have an archived record once closed.
 * GitHub Gist is used as the primary storage for transcripts because it is lightweight,
 * accessible, and persistent. If upload fails, messages are stored inline in MongoDB.
 */

const { GIST_TOKEN } = require('../config.json');

/**
 * Formats Discord messages into a plain text transcript.
 * @param {Array} messages - Array of Discord message objects.
 * @returns {string} Formatted transcript as plain text.
 */
function formatTranscript(messages) {
  return messages
    .map(
      msg =>
        `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${
          msg.content || '[Embed/Attachment]'
        }`
    )
    .join('\n');
}

/**
 * Uploads a transcript to GitHub Gist.
 *
 * @param {Array} messages - Array of Discord messages.
 * @param {object} channel - Discord channel object (used for naming).
 * @param {object} guildConfig - Guild configuration object (for context).
 * @returns {Promise<string|null>} Gist URL if successful, null if upload fails.
 */
async function uploadTranscript(messages, channel, guildConfig) {
  try {
    if (!GIST_TOKEN) {
      console.warn(
        '[Transcript] No GIST_TOKEN provided in config.json. Transcript will not be uploaded.'
      );
      return null;
    }

    const transcriptContent = formatTranscript(messages);

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `token ${GIST_TOKEN}`,
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
      console.error(
        '[Transcript] Failed to upload transcript:',
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    console.log(`[Transcript] Transcript uploaded to Gist: ${data.html_url}`);
    return data.html_url;
  } catch (error) {
    console.error('[Transcript] Error uploading transcript:', error);
    return null;
  }
}

module.exports = uploadTranscript;
