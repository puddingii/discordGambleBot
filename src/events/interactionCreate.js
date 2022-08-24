const { InteractionType } = require('discord.js');
const {
	cradle: { logger },
} = require('../config/dependencyInjection');
const { isEnrolledUser } = require('../config/middleware');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../controller/Game')} game
	 */
	async execute(interaction, game) {
		const {
			commandName,
			user: { username },
		} = interaction;
		if (interaction.type !== InteractionType.ApplicationCommand) {
			return;
		}

		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return;
		}
		const notCheckCommandList = ['유저등록'];
		if (!notCheckCommandList.includes(commandName)) {
			const isExist = await isEnrolledUser(interaction);
			if (!isExist) {
				await interaction.reply('유저정보가 없습니다. 유저등록부터 해주세요');
				return;
			}
		}

		try {
			await command.execute(interaction, game);
			logger.info(`[interactionCreate]${username} - ${commandName}`);
		} catch (error) {
			logger.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	},
};
