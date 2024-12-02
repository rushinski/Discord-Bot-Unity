const { ActivityType, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

var config = require('../config.json');
const mongoURL = config.MONGOURL;

module.exports = {
    name: 'ready', 
    once: true,
    async execute(client) { 

        client.user.setActivity({
            name: 'Listening to Commands!',
            type: ActivityType.Custom,
        });

        if (!mongoURL) return;

        await mongoose.connect(mongoURL || '', {
        });

        if (mongoose.connect) {
            console.log('I have connected to the database!');
        } else {
            console.log("I cannot connect to the database right now...");
        }

    },
};

