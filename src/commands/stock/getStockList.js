const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const {
	cradle: { StockModel, logger, util },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stocktype')
		.setDescription('주식리스트임')
		.addStringOption(option =>
			option
				.setName('타입')
				.setDescription('주식인지 코인인지')
				.addChoice('주식', 'stock')
				.addChoice('코인', 'coin')
				.addChoice('전체', 'all'),
		),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		try {
			/** Discord Info */
			const stockType = interaction.options.getString('stocktype') || 'all';
			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle('주식 리스트')
				.setDescription(`${dayjs().format('M월 DD일')} 주식리스트`)
				.addField('\u200B', '\u200B')
				.setTimestamp();

			/** DB Info */
			const stockList = await StockModel.findAllList(stockType);
			stockList.forEach(stock => {
				embedBox.addField(
					`${stock.name} - ${util.setComma(stock.value)}원`,
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
