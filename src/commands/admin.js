const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	MessageActionRow,
	MessageSelectMenu,
	Modal,
	TextInputComponent,
} = require('discord.js');
const {
	cradle: { StockModel, logger, secretKey },
} = require('../config/dependencyInjection');
const Stock = require('../controller/Gamble/Stock');
const Coin = require('../controller/Gamble/Coin');

const addStock = async interaction => {
	const modal = new Modal().setCustomId('어드민-addStock').setTitle('주식추가');
	const nameType = new TextInputComponent()
		.setCustomId('nameType')
		.setLabel('주식이름/종류')
		.setStyle('SHORT');
	const value = new TextInputComponent()
		.setCustomId('value')
		.setLabel('처음가격')
		.setStyle('SHORT');
	const ratio = new TextInputComponent()
		.setCustomId('ratio')
		.setLabel('최소/최대/배당퍼센트/조정주기(n*30분)')
		.setStyle('SHORT');
	const conditionList = new TextInputComponent()
		.setCustomId('conditionList')
		.setLabel('컨디션 - 아무일도없음/씹악재/악재/호재/씹호재')
		.setStyle('SHORT');
	const comment = new TextInputComponent()
		.setCustomId('comment')
		.setLabel('설명')
		.setStyle('PARAGRAPH');

	const actionRows = [nameType, value, ratio, conditionList, comment].map(row =>
		new MessageActionRow().addComponents(row),
	);
	// Add inputs to the modal
	modal.addComponents(...actionRows);
	await interaction.showModal(modal);
};

const updateStock = async interaction => {
	const modal = new Modal().setCustomId('어드민-updateStock').setTitle('주식업데이트');
	const nameType = new TextInputComponent()
		.setCustomId('nameType')
		.setLabel('주식이름/종류')
		.setStyle('SHORT');
	const value = new TextInputComponent()
		.setCustomId('value')
		.setLabel('처음가격')
		.setStyle('SHORT');
	const ratio = new TextInputComponent()
		.setCustomId('ratio')
		.setLabel('최소/최대/배당퍼센트/조정주기(n*30분)')
		.setStyle('SHORT');
	const conditionList = new TextInputComponent()
		.setCustomId('conditionList')
		.setLabel('컨디션 - 아무일도없음/씹악재/악재/호재/씹호재')
		.setStyle('SHORT');
	const comment = new TextInputComponent()
		.setCustomId('comment')
		.setLabel('설명')
		.setStyle('PARAGRAPH');

	const actionRows = [nameType, value, ratio, conditionList, comment].map(row =>
		new MessageActionRow().addComponents(row),
	);
	// Add inputs to the modal
	modal.addComponents(...actionRows);
	await interaction.showModal(modal);
};

const getNewSelectMenu = () => {
	return new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('어드민-main')
			.setPlaceholder('Nothing selected')
			.addOptions([
				{
					label: '주식추가',
					description: 'This is a description',
					value: 'addStock',
				},
				{
					label: '주식정보업데이트',
					description: '주식정보 강제 업데이트',
					value: 'selectStock',
				},
			]),
	);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('어드민')
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
			const adminId = interaction.options.getString('아이디');
			const adminPw = interaction.options.getString('비밀번호');

			if (adminId !== secretKey.adminId || adminPw !== secretKey.adminPw) {
				await interaction.reply({
					content: '아이디와 비밀번호를 확인해주세요',
					ephemeral: true,
				});
				return;
			}

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
	 * @param {{ selectedList: string[] }} selectOptions
	 */
	async select(interaction, game, { selectedList }) {
		try {
			const command = selectedList[0].split('-');
			switch (command[0]) {
				case 'addStock':
					await addStock(interaction);
					break;
				case 'selectStock':
					await interaction.reply({
						content: 'Admin Options',
						components: [
							new MessageActionRow().addComponents(
								new MessageSelectMenu()
									.setCustomId('어드민')
									.setPlaceholder('Nothing selected')
									.addOptions([
										{
											label: '111',
											description: 'This is a description',
											value: 'updateStock-1', // format: [select command 명령어-callback]
										},
										{
											label: '222',
											description: '주식정보 강제 업데이트',
											value: 'updateStock-2',
										},
									]),
							),
						],
						ephemeral: true,
					});
					break;
				case 'updateStock':
					await updateStock(interaction);
					break;
				default:
					break;
			}
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
			const MAX_RATIO = 0.2;
			const [name, type] = interaction.fields.getTextInputValue('nameType').split('/');
			const value = Number(interaction.fields.getTextInputValue('value'));
			const [minRatio, maxRatio, dividend, correctionCnt] = interaction.fields
				.getTextInputValue('ratio')
				.split('/');
			const conditionList = interaction.fields
				.getTextInputValue('conditionList')
				.split('/')
				.map(Number);
			const comment = interaction.fields.getTextInputValue('comment');

			if (conditionList.length !== 5) {
				await interaction.reply({
					content: '조정 퍼센트 입력형식이 이상합니다. 다시 입력해주세요.',
					ephemeral: true,
				});
				return;
			}

			const isOverMaxRatio = ratio => {
				return Math.abs(ratio) > MAX_RATIO;
			};

			if (
				isOverMaxRatio(minRatio) ||
				isOverMaxRatio(maxRatio) ||
				isOverMaxRatio(dividend) ||
				conditionList.some(isOverMaxRatio)
			) {
				await interaction.reply({
					content: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.',
					ephemeral: true,
				});
				return;
			}

			const param = {
				name,
				type,
				value,
				comment,
				minRatio,
				maxRatio,
				correctionCnt,
				conditionList,
				dividend,
			};
			/** DB Info */
			const result = await StockModel.addStock(param);

			const content = result.code === 1 ? '등록완료!' : result.message;
			if (result.code) {
				const classParam = {
					ratio: { min: param.minRatio, max: param.maxRatio },
					...param,
					updateTime: secretKey.stockUpdateTime,
				};
				const stock = type === 'stock' ? new Stock(classParam) : new Coin(classParam);
				game.gamble.addStock(stock);
			}

			await interaction.reply({
				content,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
};
