const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const _ = require('lodash');
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
			const condition = game.gamble.curCondition;
			let conditionText = '';
			switch (condition) {
				case 1:
					conditionText = '돔황챠~~';
					break;
				case 2:
					conditionText = '수익내기 힘든 자리임';
					break;
				case 3:
					conditionText = '올ㅋ 다들 적극적으로 투자하는중';
					break;
				case 4:
					conditionText = '주식을 모르는 사람도 투자하는 시기';
					break;
				default:
					conditionText = '아무일도 없음';
			}
			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle('주식 리스트')
				.setDescription(
					`${dayjs().format(
						'M월 DD일',
					)} 주식리스트\n현재 시장흐름 상황: ${conditionText}`,
				)
				.addField('\u200B', '\u200B')
				.setTimestamp();

			/** DB Info */
			const stockList = game.gamble.getAllStock(stockType);
			stockList.forEach(stock => {
				embedBox.addField(
					`${stock.name} ${stock.type === 'stock' ? '주식' : '코인'} - ${util.setComma(
						_.round(stock.value, 2),
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
