const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	cradle: { StockModel, logger, secretKey },
} = require('../../config/dependencyInjection');
const Stock = require('../../controller/Gamble/Stock');
const Coin = require('../../controller/Gamble/Coin');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식매도')
		.setDescription('주식 or 코인 사기')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		)
		.addBooleanOption(option =>
			option.setName('풀매도').setDescription('풀매도 할거?').setRequired(true),
		)
		.addNumberOption(option => option.setName('수량').setDescription('몇개나 팔건지')),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름');
			const isFull = interaction.options.getBoolean('풀매도');
			const cnt = isFull ? 1 : interaction.options.getNumber('수량');

			if (!isFull && cnt < 0) {
				await interaction.reply({ content: '갯수를 입력해주세요' });
				return;
			}

			const result = game.gamble.buySellStock(discordId, name, cnt * -1, isFull);
			const content = result.code ? '판매완료' : result.message;

			await interaction.reply({ content });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
