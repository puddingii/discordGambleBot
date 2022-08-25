const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	MessageActionRow,
	MessageSelectMenu,
	Modal,
	TextInputComponent,
} = require('discord.js');
const {
	cradle: { logger },
} = require('../config/dependencyInjection');

const getNewSelectMenu = () => {
	return new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('어드민접속')
			.setPlaceholder('Nothing selected')
			.addOptions([
				{
					label: '주식추가',
					description: 'This is a description',
					value: 'addStock',
				},
				{
					label: 'DB불러오기',
					description: 'DB정보로 다시 Class갱신',
					value: 'loadDB',
				},
			]),
	);
};

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

			await interaction.reply({
				content: 'Admin Options',
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
	/**
	 * @param {import('discord.js').SelectMenuInteraction} interaction
	 * @param {import('../controller/Game')} game
	 * @param {string[]} selectedList
	 */
	async select(interaction, game, selectedList) {
		try {
			const modal = new Modal().setCustomId('어드민접속').setTitle('My Modal');
			const favoriteColorInput = new TextInputComponent()
				.setCustomId('favoriteColorInput')
				// The label is the prompt the user sees for this input
				.setLabel("What's your favorite color?")
				// Short means only a single line of text
				.setStyle('SHORT');
			const hobbiesInput = new TextInputComponent()
				.setCustomId('hobbiesInput')
				.setLabel("What's some of your favorite hobbies?")
				// Paragraph means multiple lines of text.
				.setStyle('PARAGRAPH');
			// An action row only holds one text input,
			// so you need one action row per text input.
			const firstActionRow = new MessageActionRow().addComponents(favoriteColorInput);
			const secondActionRow = new MessageActionRow().addComponents(hobbiesInput);
			// Add inputs to the modal
			modal.addComponents(firstActionRow, secondActionRow);
			await interaction.showModal(modal);
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
	/**
	 * @param {import('discord.js').ModalSubmitInteraction} interaction
	 * @param {import('../controller/Game')} game
	 */
	async modalSubmit(interaction, game) {
		try {
			await interaction.reply({
				content: 'qweqweAdmin Options',
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
};
