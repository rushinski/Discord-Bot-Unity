const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName('role-select')
    .setDescription('Sends role select buttons'),
  async execute(interaction, client) {
    try {
      // Defer the reply to give us time to process
      await interaction.deferReply({ ephemeral: true });

      // Create buttons for alliances
      const buttonOne = new ButtonBuilder()
        .setCustomId('1276242775347826839')
        .setStyle(ButtonStyle.Primary)
        .setLabel('North America');

      const buttonTwo = new ButtonBuilder()
        .setCustomId('1276243108551725219')
        .setStyle(ButtonStyle.Primary)
        .setLabel('South America');

      const buttonThree = new ButtonBuilder()
        .setCustomId('1276243169029259334')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Europe');

      const buttonFour = new ButtonBuilder()
        .setCustomId('1276243229670375559')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Asia');

      const buttonFive = new ButtonBuilder()
        .setCustomId('1276243415725637703')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Africa');

      const buttonSix = new ButtonBuilder()
        .setCustomId('1276243664397664266')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Oceania');

      const buttonSeven = new ButtonBuilder()
        .setCustomId('1276243451737935872')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Antarctica');

      // Create buttons for identity
      const buttonGuy = new ButtonBuilder()
        .setCustomId('1276294197506474085')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Guy');

      const buttonGirl = new ButtonBuilder()
        .setCustomId('1276294230808985631')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Girl');

      const buttonOther = new ButtonBuilder()
        .setCustomId('1276294273213661184')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Other');

      // Create buttons for spending
      const buttonF2P = new ButtonBuilder()
        .setCustomId('1276302445898764309')
        .setStyle(ButtonStyle.Primary)
        .setLabel('F2P');

      const buttonLow = new ButtonBuilder()
        .setCustomId('1276302487594205287')
        .setStyle(ButtonStyle.Primary)
        .setLabel('1-150');

      const buttonMid = new ButtonBuilder()
        .setCustomId('1276302567709868113')
        .setStyle(ButtonStyle.Primary)
        .setLabel('150-400');

      const buttonHigh = new ButtonBuilder()
        .setCustomId('1276302610131062824')
        .setStyle(ButtonStyle.Primary)
        .setLabel('400-1000');

      const buttonWhale = new ButtonBuilder()
        .setCustomId('1276302655529943140')
        .setStyle(ButtonStyle.Primary)
        .setLabel('1000-5000');

      const buttonBigger = new ButtonBuilder()
        .setCustomId('1276302688224804974')
        .setStyle(ButtonStyle.Primary)
        .setLabel('5000+');
      
      //Create Buttons for troop type
      const buttonInfantry = new ButtonBuilder()
        .setCustomId('1276313415026999297')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Infantry');

      const buttonCavalry = new ButtonBuilder()
        .setCustomId('1276313802786476105')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Cavalry');

      const buttonArchers = new ButtonBuilder()
        .setCustomId('1276313485181190155')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Archers');

      const buttonSiege = new ButtonBuilder()
        .setCustomId('1276313457989386335')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Siege');

      // Create buttons for kvk

      const buttonNew = new ButtonBuilder()
        .setCustomId('1276327962144411729')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Brand New');

      const buttonKvkNo = new ButtonBuilder()
        .setCustomId('1276328406790832140')
        .setStyle(ButtonStyle.Primary)
        .setLabel('No KvK Experience');

      const buttonKvkOne = new ButtonBuilder()
        .setCustomId('1276328277895680132')
        .setStyle(ButtonStyle.Primary)
        .setLabel('KvK1');

      const buttonKvkTwo = new ButtonBuilder()
        .setCustomId('1276328318471245905')
        .setStyle(ButtonStyle.Primary)
        .setLabel('KvK2');

      const buttonKvkThree = new ButtonBuilder()
        .setCustomId('1276328342382972949')
        .setStyle(ButtonStyle.Primary)
        .setLabel('KvK3');

      const buttonSoc = new ButtonBuilder()
        .setCustomId('1276328371181322240')
        .setStyle(ButtonStyle.Primary)
        .setLabel('SoC');

      // jumper
      const buttonNewJumper = new ButtonBuilder()
        .setCustomId('1276329026612363309')
        .setStyle(ButtonStyle.Primary)
        .setLabel('New Jumper');

      const buttonPastJumper = new ButtonBuilder()
        .setCustomId('1276329091259305984')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Jumped Before');


      // Define rows for buttons
      const row1 = new ActionRowBuilder().addComponents(buttonOne, buttonTwo, buttonThree, buttonFour, buttonFive);
      const row2 = new ActionRowBuilder().addComponents(buttonSix, buttonSeven);
      const row3 = new ActionRowBuilder().addComponents(buttonGuy, buttonGirl, buttonOther);
      const row4 = new ActionRowBuilder().addComponents(buttonF2P, buttonLow, buttonMid, buttonHigh, buttonWhale);
      const row5 = new ActionRowBuilder().addComponents(buttonBigger);
      const row6 = new ActionRowBuilder().addComponents(buttonInfantry, buttonCavalry, buttonArchers, buttonSiege);
      const row7 = new ActionRowBuilder().addComponents(buttonNew, buttonKvkNo, buttonKvkOne, buttonKvkTwo, buttonKvkThree);
      const row8 = new ActionRowBuilder().addComponents(buttonSoc);
      const row9 = new ActionRowBuilder().addComponents(buttonNewJumper, buttonPastJumper);

      // Fetch the channel and send messages
      const channel = await client.channels.fetch(interaction.channelId);

      // Send the message with alliance buttons
      await channel.send({
        content: `**Click one of the buttons to pick which alliance you'd like to join:**`,
        components: [row1, row2],
      });

      // Send the message with identity buttons
      await channel.send({
        content: `**Click one of the buttons to pick your identity:**`,
        components: [row3],
      });

      // Send the message with spending buttons
      await channel.send({
        content: `**Click one of the buttons to pick your potential monthly spending:**`,
        components: [row4, row5],
      });

      // Send the message with troop types
      await channel.send({
        content: `**Click one of the buttons to pick your troop type:**`,
        components: [row6],
      });

      await channel.send({
        content: `**Click one of the buttons to pick your experience:**`,
        components: [row7, row8],
      });

      await channel.send({
        content: `**Click one of the buttons to pick your jumping experince:**`,
        components: [row9],
      });

      // Optionally, acknowledge the original interaction
      await interaction.editReply({
        content: 'The buttons have been sent!',
      });
      
    } catch (error) {
      console.error('Error handling interaction:', error);
      await interaction.editReply({
        content: 'An error occurred while processing your request.',
      });
    }
  }
};
