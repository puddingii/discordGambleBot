const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const _ = require('lodash');
const {
	cradle: { logger, util },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder().setName('내주식').setDescription('내 주식임'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle('내 주식 리스트')
				.setDescription(`${dayjs().format('M월 DD일')} 내 주식리스트`)
				.addField('\u200B', '\u200B')
				.setTimestamp();

			/** DB Info */
			const { stockList, totalCnt } = game.gamble.getMyStock(discordId);
			stockList.reduce(
				(acc, stock) => {
					const upDownEmoji = num => {
						if (num > 0) {
							return `🔺 ${num}`;
						}
						if (num < 0) {
							return `🔻 ${num}`;
						}
						return `🟥 ${num}`;
					};
					embedBox.addField(
						`${stock.name} ${
							stock.stockType === 'stock' ? '주식' : '코인'
						} - ${util.setComma(_.round(stock.stockValue, 2))}원 (${upDownEmoji(
							stock.stockBeforeRatio,
						)}%)`,
						`내 포지션: ${util.setComma(_.round(stock.myValue, 2))}원\n수익률: ${
							stock.myRatio
						}%\n보유비중: ${stock.cnt}개 (${_.round((stock.cnt / totalCnt) * 100, 2)}%)`,
					);
					acc.stockValue += stock.stockValue * stock.cnt;
					acc.myValue += stock.myValue * stock.cnt;

					return acc;
				},
				{ stockValue: 0, myValue: 0 },
			);

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
