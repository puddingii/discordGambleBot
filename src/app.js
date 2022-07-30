const { Client, Intents } = require('discord.js');
const loaders = require('./loaders/index');
const { botToken } = require('./config/secretKey');

const startServer = async () => {
	const client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_PRESENCES,
		],
	});

	await loaders({ client });

	client.login(botToken);
};

startServer();
