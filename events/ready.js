const { ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const RoleReactionMessage = require('../schemas/RoleReactionMessage');
const config = require('../config.json');

module.exports = {
    name: 'ready',
    once: true, // Ensure this only runs once
    async execute(client) {

        // Set bot activity
        client.user.setActivity({
            name: 'Listening to Commands...',
            type: ActivityType.Custom,
        });

        // Connect to MongoDB
        const mongoURL = config.MONGOURL;
        if (!mongoURL) {
            console.error('MongoDB URL is missing in config.');
            return;
        }

        try {
            await mongoose.connect(mongoURL); // Remove deprecated options
            console.log('Connected to the database!');
        } catch (error) {
            console.error('Error connecting to the database:', error);
            return;
        }

        // Initialize Reaction Messages
        try {
            const reactionMessages = await RoleReactionMessage.find();

            if (!reactionMessages.length) {
                console.log('No reaction messages found in the database.');
                return;
            }

            for (const messageData of reactionMessages) {
                const channel = await client.channels.fetch(messageData.channelId);
                if (!channel) {
                    console.log(`Channel ${messageData.channelId} not found.`);
                    continue;
                }

                const message = await channel.messages.fetch(messageData.messageId);
                if (!message) {
                    console.log(`Message ${messageData.messageId} not found.`);
                    continue;
                }

                console.log(`Reaction message loaded: ${message.id}`);
            }
        } catch (error) {
            console.error('Error loading reaction messages:', error);
        }
    },
};
