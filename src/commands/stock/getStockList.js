const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const {
	cradle: { logger, util },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식리스트')
		.setDescription('주식리스트임. 옵션이 없으면 기본으로 전체가 뜸.')
		.addStringOption(option =>
			option
				.setName('종류')
				.setDescription('주식인지 코인인지')
				.addChoice('주식', 'stock')
				.addChoice('코인', 'coin')
				.addChoice('전체', 'all'),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const stockType = interaction.options.getString('종류') || 'all';
			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle('주식 리스트')
				.setDescription(`${dayjs().format('M월 DD일')} 주식리스트`)
				.addField('\u200B', '\u200B')
				.setTimestamp();

			/** DB Info */
			const stockList = game.gamble.getAllStock(stockType);
			stockList.forEach(stock => {
				embedBox.addField(
					`${stock.name} ${stock.type === 'stock' ? '주식' : '코인'} - ${util.setComma(
						stock.value,
					)}원`,
					stock.comment,
				);
			});

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
