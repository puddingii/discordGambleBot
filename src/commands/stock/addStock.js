const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	cradle: { StockModel, logger, secretKey },
} = require('../../config/dependencyInjection');
const Stock = require('../../controller/Gamble/Stock');
const Coin = require('../../controller/Gamble/Coin');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식코인추가')
		.setDescription('주식 or 코인 추가하기 (어드민 전용)')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('종류')
				.setDescription('주식인지 코인인지')
				.setRequired(true)
				.addChoice('주식', 'stock')
				.addChoice('코인', 'coin'),
		)
		.addNumberOption(option =>
			option.setName('가격').setDescription('1주당 가격').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('설명').setDescription('설명').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('최소변동률').setDescription('최소 퍼센트').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('최대변동률').setDescription('최대 퍼센트').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('조정주기').setDescription('30분 * n').setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('컨디션퍼센트')
				.setDescription(
					'아무일도없음/씹악재/악재/호재/씹호재(추가변동률) (0.01/-0.06/-0.05/0.03/0.06)',
				)
				.setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('배당퍼센트').setDescription('배당').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('패스워드').setDescription('관리자 패스워드').setRequired(true),
		),

	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const name = interaction.options.getString('이름');
			const type = interaction.options.getString('종류');
			const value = interaction.options.getNumber('가격');
			const comment = interaction.options.getString('설명');
			const minRatio = interaction.options.getNumber('최소변동률');
			const maxRatio = interaction.options.getNumber('최대변동률');
			const correctionCnt = interaction.options.getNumber('조정주기');
			let conditionList = interaction.options.getString('컨디션퍼센트');
			const dividend = interaction.options.getNumber('배당퍼센트');
			const passwd = interaction.options.getString('패스워드');

			const MAX_RATIO = 0.2;

			if (passwd !== secretKey.adminPw) {
				await interaction.reply({
					content: '어드민 비밀번호가 다릅니다',
					ephemeral: true,
				});
				return;
			}

			conditionList = conditionList.split('/').map(value => parseFloat(value, 10));
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

			await interaction.reply({ content, ephemeral: true });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
};
