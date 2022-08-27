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

const getNewSelectMenu = () => {
	return new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('어드민-main')
			.setPlaceholder('Nothing selected')
			.addOptions([
				{
					label: '주식추가',
					description: 'This is a description',
					value: 'showAddStockModal',
				},
				{
					label: '주식정보업데이트',
					description: '주식정보 강제 업데이트',
					value: 'selectStock',
				},
			]),
	);
};

/**
 * @param {import('discord.js').SelectMenuInteraction} interaction
 * @param {import('../controller/Game')} game
 * @param {string} stockName
 */
const showStockModal = async (interaction, game, stockName) => {
	const modal = new Modal()
		.setCustomId(`어드민-${stockName ? 'updateStock' : 'addStock'}`)
		.setTitle('주식 추가/업데이트');

	const nameType = new TextInputComponent()
		.setCustomId('nameType')
		.setLabel('주식이름/종류 (업데이트는 이름과 종류를 바꿀 수 없음)')
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

	if (stockName) {
		const stock = game.gamble.getStock('', stockName);
		nameType.setValue(`${stock.name}/${stock.type}`);
		value.setValue(`${stock.value}`);
		const { min, max } = stock.getRatio();
		ratio.setValue(`${min}/${max}/${stock.dividend}/${stock.correctionCnt}`);
		conditionList.setValue(`${stock?.conditionList.join('/')}`);
		comment.setValue(`${stock.comment}`);
	}

	const actionRows = [nameType, value, ratio, conditionList, comment].map(row =>
		new MessageActionRow().addComponents(row),
	);
	// Add inputs to the modal
	modal.addComponents(...actionRows);
	await interaction.showModal(modal);
};

const chkStockOptions = param => {
	const MAX_RATIO = 0.2;
	if (param.conditionList.length !== 5) {
		return { code: 0, message: '조정 퍼센트 입력형식이 이상합니다. 다시 입력해주세요.' };
	}

	const isOverMaxRatio = ratio => {
		return Math.abs(ratio) > MAX_RATIO;
	};

	if (
		isOverMaxRatio(param.minRatio) ||
		isOverMaxRatio(param.maxRatio) ||
		isOverMaxRatio(param.dividend) ||
		param.conditionList.some(isOverMaxRatio)
	) {
		return { code: 0, message: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.' };
	}

	return { code: 1 };
};

/**
 * @param {import('discord.js').SelectMenuInteraction} interaction
 * @param {import('../controller/Game')} game
 * @param {boolean} isNew
 */
const updateStock = async (interaction, game, isNew) => {
	try {
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
		const { code, message } = chkStockOptions(param);
		if (!code) {
			await interaction.reply({
				content: message,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
			return;
		}
		/** DB Info */
		let content = '';
		const classParam = {
			ratio: { min: param.minRatio, max: param.maxRatio },
			...param,
			updateTime: secretKey.stockUpdateTime,
		};
		if (isNew) {
			const stock = type === 'stock' ? new Stock(classParam) : new Coin(classParam);
			const gambleResult = game.gamble.addStock(stock);
			if (!gambleResult.code) {
				await interaction.reply({
					content: gambleResult.message,
					components: [getNewSelectMenu()],
					ephemeral: true,
				});
				return;
			}
			const dbResult = await StockModel.addStock(param);
			content = dbResult.code ? '주식추가 완료' : dbResult.message;
		} else {
			const stock = game.gamble.getStock(type, name);
			if (!stock) {
				await interaction.reply({
					content: `해당하는 이름의 ${type === 'stock' ? '주식' : '코인'}이 없습니다.`,
					components: [getNewSelectMenu()],
					ephemeral: true,
				});
				return;
			}
			stock.comment = param.comment;
			stock.conditionList = param.conditionList;
			stock.value = param.value;
			stock.dividend = param.dividend;
			stock.setRatio({ min: param.minRatio, max: param.maxRatio });
			stock.correctionCnt = param.correctionCnt;

			const dbResult = await StockModel.updateStock(param);
			content = dbResult.code ? '주식 업데이트 완료' : dbResult.message;
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
			const stockList = game.gamble.getAllStock().map(stock => ({
				label: stock.name,
				value: `updateStock-${stock.name}`,
				description: stock.type,
			}));
			switch (command[0]) {
				case 'showAddStockModal': // 주식종류 추가하는 모달창 띄우기
					await showStockModal(interaction);
					break;
				case 'updateStock': // 주식 업데이트
					await showStockModal(interaction, game, command[1]);
					break;
				case 'selectStock': // 주식 업데이트에서 누른 주식
					await interaction.reply({
						content: 'Admin Options',
						components: [
							new MessageActionRow().addComponents(
								new MessageSelectMenu()
									.setCustomId('어드민')
									.setPlaceholder('주식 리스트')
									.addOptions(stockList),
							),
						],
						ephemeral: true,
					});
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
	 * @param {{ callFuncName: string }} options
	 */
	async modalSubmit(interaction, game, { callFuncName }) {
		try {
			switch (callFuncName) {
				case 'addStock':
					await updateStock(interaction, game, true);
					break;
				case 'updateStock':
					await updateStock(interaction, game);
					break;
				default:
			}
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
};
