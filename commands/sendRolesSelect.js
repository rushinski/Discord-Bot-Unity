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
      .setDescription(
        `React to this embed with the corresponding emoji that relates to where you are from!\n🦁︱**Africa**\n🦅︱**North America**\n🦜︱**South America**\n🐂︱**Europe**\n🐼︱**Asia**\n🐨︱**Australia**\n🐧︱**Antarctica**`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const continentMessage = await interaction.reply({ embeds: [continentEmbed], fetchReply: true });
    fs.writeFileSync(path.join('txtIds', 'continentEmbed.txt'), continentMessage.id);

    await continentMessage.react('🦁');
    await continentMessage.react('🦅');
    await continentMessage.react('🦜');
    await continentMessage.react('🐂');
    await continentMessage.react('🐼');
    await continentMessage.react('🐨');
    await continentMessage.react('🐧');

    // Create the spending embed
    const spenderEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('How much money will you potentially spend monthly? 💵')
      .setDescription(
        `React to this embed with the corresponding emoji that relates to your potentially monthly spending habits!\n🦐︱**$0**\n🐟︱**$1-150**\n🐬︱**$150-400**\n🦈︱**$400-1000**\n🐋︱**$1000-5000**\n🦑︱**$5000+**`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const spenderMessage = await interaction.followUp({ embeds: [spenderEmbed], fetchReply: true });
    fs.writeFileSync(path.join('txtIds', 'spenderEmbed.txt'), spenderMessage.id);

    await spenderMessage.react('🦐');
    await spenderMessage.react('🐟');
    await spenderMessage.react('🐬');
    await spenderMessage.react('🦈');
    await spenderMessage.react('🐋');
    await spenderMessage.react('🦑');

    // Create the gender embed
    const genderEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('What gender are you? 🧬')
      .setDescription(
        `React to this embed with the corresponding emoji that relates to your gender!\n👦︱**Male**\n👧︱**Female**\n❓︱**Other**`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const genderMessage = await interaction.followUp({ embeds: [genderEmbed], fetchReply: true });
    fs.writeFileSync(path.join('txtIds', 'genderEmbed.txt'), genderMessage.id);

    await genderMessage.react('👦');
    await genderMessage.react('👧');
    await genderMessage.react('❓');

    // Create the troop embed
    const troopEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('What troop type will you play as? 🪖')
      .setDescription(
        `React to this embed with the corresponding emoji that relates to your troop type!\n⚔️︱**Infantry**\n🐎︱**Cavalry**\n🏹︱**Archers**\n🚜︱**Siege**`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const troopMessage = await interaction.followUp({ embeds: [troopEmbed], fetchReply: true });
    fs.writeFileSync(path.join('txtIds', 'troopEmbed.txt'), troopMessage.id);

    await troopMessage.react('⚔️');
    await troopMessage.react('🐎');
    await troopMessage.react('🏹');
    await troopMessage.react('🚜');

    // Create the experience embed
    const experienceEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('What is your past experience? ⭐')
      .setDescription(
        `React to this embed with the corresponding emoji that relates to your past experience!\n🥚︱**Brand New**\n🐣︱**No KvK Experience**\n1️⃣︱**KvK1**\n2️⃣︱**KvK2**\n3️⃣︱**KvK3**\n⭐︱**Season of Conquest (Soc)**`
      )
      .setFooter({ text: 'ORDER OF THE CRIMSON MOON 2024 ®' });

    const experienceMessage = await interaction.followUp({ embeds: [experienceEmbed], fetchReply: true });
    fs.writeFileSync(path.join('txtIds', 'experienceEmbed.txt'), experienceMessage.id);

    await experienceMessage.react('🥚');
    await experienceMessage.react('🐣');
    await experienceMessage.react('1️⃣');
    await experienceMessage.react('2️⃣');
    await experienceMessage.react('3️⃣');
    await experienceMessage.react('⭐');
  },
};
