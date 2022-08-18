const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {
	cradle: { logger },
} = require('../../config/dependencyInjection');
const { setComma } = require('../../config/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('랭킹')
		.setDescription('가지고 있는 돈과 주식 등을 합한 랭킹, 무기강화 수치 등등..'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const rankingList = game.getUserList().map(user => {
				const money =
					user.stockList.reduce((acc, cur) => {
						acc += cur.cnt * cur.stock.value;
						return acc;
					}, 0) + user.money;
				return { name: user.nickname, money };
			});

			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle('랭킹')
				.setDescription('가지고 있는 돈과 주식 등을 합한 랭킹, 무기강화 수치 등등..')
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			rankingList.forEach(user => {
				embedBox.addFields({
					name: `${user.name}`,
					value: `${setComma(user.money, true)}원`,
					inline: true,
				});
			});
			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
