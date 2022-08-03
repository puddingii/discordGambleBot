const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
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
			const stockList = game.gamble.getMyStock(discordId);
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
