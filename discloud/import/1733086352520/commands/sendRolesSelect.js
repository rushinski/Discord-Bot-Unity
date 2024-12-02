const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('send-role-select')
    .setDescription('Sends all the role selection embeds.'),

  async execute(interaction) {
    // Ensure the txtIds directory exists
    if (!fs.existsSync('txtIds')) {
      fs.mkdirSync('txtIds');
    }

    // Create the continent embed
    const continentEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('Where are you from? 🌍')
      .setDescription(`
        React to this embed with the corresponding emoji that relates to where you are from!

        🦁︱**Africa**  
        🦅︱**North America**  
        🦜︱**South America**  
        🐂︱**Europe**  
        🐼︱**Asia**  
        🐨︱**Australia**  
        🐧︱**Antarctica**
      `)
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the continent embed and fetch the message
    const continentMessage = await interaction.reply({ embeds: [continentEmbed], fetchReply: true });

    // Save the message ID to a file
    fs.writeFileSync(path.join('txtIds', 'continentEmbed.txt'), continentMessage.id);

    // Add reactions for each continent
    await continentMessage.react('🦁'); // Africa
    await continentMessage.react('🦅'); // North America
    await continentMessage.react('🦜'); // South America
    await continentMessage.react('🐂'); // Europe
    await continentMessage.react('🐼'); // Asia
    await continentMessage.react('🐨'); // Australia
    await continentMessage.react('🐧'); // Antarctica

    // Create the spending embed
    const spenderEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('How much money will you potentially spend monthly? 💵')
      .setDescription(`
        React to this embed with the corresponding emoji that relates to your potentially monthly spending habits!
        
        🦐︱**$0**  
        🐟︱**$1-150**  
        🐬︱**$150-400**  
        🦈︱**$400-1000**  
        🐋︱**$1000-5000**  
        🦑︱**$5000+**  
      `)
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the spending embed and fetch the message
    const spenderMessage = await interaction.followUp({ embeds: [spenderEmbed], fetchReply: true });

    // Save the message ID to a file
    fs.writeFileSync(path.join('txtIds', 'spenderEmbed.txt'), spenderMessage.id);

    // Add reactions to the spending message
    await spenderMessage.react('🦐'); // 0
    await spenderMessage.react('🐟'); // 1-150
    await spenderMessage.react('🐬'); // 150-400
    await spenderMessage.react('🦈'); // 400-1000
    await spenderMessage.react('🐋'); // 1000-5000
    await spenderMessage.react('🦑'); // 5000+

    // Create the gender embed
    const genderEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('What gender are you? 🧬')
      .setDescription(`
        React to this embed with the corresponding emoji that relates to your gender!

        👦︱**Male**
        👧︱**Female**
        ❓︱**Other**
      `)
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    // Send the gender embed and fetch the message
    const genderMessage = await interaction.followUp({ embeds: [genderEmbed], fetchReply: true });

    // Save the message ID to a file
    fs.writeFileSync(path.join('txtIds', 'genderEmbed.txt'), genderMessage.id);

    // Add reactions for gender
    await genderMessage.react('👦'); // Male
    await genderMessage.react('👧'); // Female
    await genderMessage.react('❓'); // Other

    const troopEmbed = new EmbedBuilder()
    .setColor('Blue')
    .setTitle('What troop type will you play as? 🪖')
    .setDescription(`
      React to this embed with the corresponding emoji that relates to your troop type!

      ⚔️︱**Infantry**
      🐎︱**Cavalry**
      🏹︱**Archers**
      🚜︱**Siege**
    `)
    .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

  // Send the troop embed and fetch the message
  const troopMessage = await interaction.followUp({ embeds: [troopEmbed], fetchReply: true });

  // Save the message ID to a file
  fs.writeFileSync(path.join('txtIds', 'troopEmbed.txt'), troopMessage.id);

  // Add reactions for troop types
  await troopMessage.react('⚔️'); // Infantry
  await troopMessage.react('🐎'); // Cavalry
  await troopMessage.react('🏹'); // Archers
  await troopMessage.react('🚜'); // Siege
  },
};
