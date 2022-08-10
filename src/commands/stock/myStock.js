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

			const formatIntComma = num => {
				return util.setComma(Math.floor(num));
			};
			/** DB Info */
			const { stockList, totalMyValue, totalStockValue } =
				game.gamble.getMyStock(discordId);
			const totalCalc = stockList.reduce((acc, stock) => {
				const upDownEmoji = num => {
					return `${num >= 0 ? '🔺' : '🔻'} ${num}`;
				};

				const calcPrice = stock.cnt * (stock.stockValue - stock.myValue);
				acc += calcPrice;
				embedBox.addField(
					`${stock.name} ${
						stock.stockType === 'stock' ? '주식' : '코인'
					} - ${formatIntComma(stock.stockValue)}원 (${upDownEmoji(
						stock.stockBeforeRatio,
					)}%)`,
					`내 포지션: ${formatIntComma(stock.myValue)}원\n손익,수익률: ${formatIntComma(
						calcPrice,
					)}원 (${stock.myRatio}%)\n보유비중: ${stock.cnt}개 | ${_.round(
						((stock.cnt * stock.myValue) / totalMyValue) * 100,
						2,
					)}%`,
				);
				return acc;
			}, 0);
			embedBox
				.addField('\u200B', '\u200B')
				.addField(
					'요약',
					`총 투자액: ${util.setComma(
						Math.floor(totalMyValue),
					)}원\n총 주식평단가: ${formatIntComma(
						totalStockValue,
					)}\n총 수익: ${util.setComma(Math.floor(totalCalc))}원\n총 수익률: ${_.round(
						(totalStockValue / totalMyValue) * 100,
						2,
					)}%`,
				);

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
