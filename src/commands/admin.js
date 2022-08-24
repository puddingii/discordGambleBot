const { SlashCommandBuilder, SelectMenuBuilder } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('어드민접속')
		.setDescription('관리자만 접속할 수 있다.')
    .addStringOption(option =>
			option.setName('아이디').setDescription('아이디').setRequired(true),
		)
		.addStringOption(option => 
			option.setName('비밀번호').setDescription('비밀번호').setRequired(true),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const adminId = interaction.options.getString('아이디');
			const adminPw = interaction.options.getString('비밀번호');


			await interaction.reply({ content: 'ㅋㅋ',components:[SelectMenu] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
