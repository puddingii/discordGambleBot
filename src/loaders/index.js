const dbLoader = require('./db');
const gameLoader = require('./game');
const botLoader = require('./bot');

/**
 * @param {object} app
 * @param {import('discord.js').Client} app.client
 */
module.exports = async ({ client }) => {
	await dbLoader();
	const game = gameLoader();
	botLoader(client, game);
};
