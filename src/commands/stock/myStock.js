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
			const { stockList, totalCnt, totalMyValue, totalStockValue } =
				game.gamble.getMyStock(discordId);
			stockList.forEach(stock => {
				const upDownEmoji = num => {
					return `${num >= 0 ? '🔺' : '🔻'} ${num}`;
				};
				const formatIntComma = num => {
					return util.setComma(Math.floor(num));
				};
				const calcPrice = stock.cnt * (stock.stockValue - stock.myValue);
				embedBox.addField(
					`${stock.name} ${
						stock.stockType === 'stock' ? '주식' : '코인'
					} - ${formatIntComma(stock.stockValue)}원 (${upDownEmoji(
						stock.stockBeforeRatio,
					)}%)`,
					`내 포지션: ${formatIntComma(stock.myValue)}원\n수익률: ${
						stock.myRatio
					}%\n평가손익: ${formatIntComma(calcPrice)}원\n보유갯수|전체비중: ${
						stock.cnt
					}개 | ${_.round((stock.cnt / totalCnt) * 100, 2)}%`,
				);
			});
			embedBox
				.addField('\u200B', '\u200B')
				.addField(
					'요약',
					`총 평가: ${util.setComma(
						Math.floor(totalMyValue),
					)}원\n총 매입: ${util.setComma(
						Math.floor(totalStockValue),
					)}원\n총 수익률: ${_.round((totalStockValue / totalMyValue) * 100, 2)}%`,
				);

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
