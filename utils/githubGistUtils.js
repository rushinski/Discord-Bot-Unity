const axios = require('axios');

async function uploadToGist(fileName, content, githubToken) {
  const apiUrl = 'https://api.github.com/gists';

  const gistData = {
    description: 'Ticket Transcript',
    public: false, // Private Gist
    files: {
      [fileName]: {
        content,
      },
    },
  };

  try {
    const response = await axios.post(apiUrl, gistData, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.html_url; // Returns the URL of the created Gist
  } catch (error) {
    console.error('Error uploading to GitHub Gist:', error.message);
    throw new Error('Failed to upload transcript to Gist.');
  }
}
