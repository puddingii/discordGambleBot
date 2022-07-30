const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	cradle: { StockModel, logger, secretKey },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식코인추가')
		.setDescription('주식 or 코인 추가하기 (어드민 전용)')
		.addStringOption(option =>
			option.setName('name').setDescription('주식이름').setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('주식인지 코인인지')
				.setRequired(true)
				.addChoice('주식', 'stock')
				.addChoice('코인', 'coin'),
		)
		.addNumberOption(option =>
			option.setName('value').setDescription('1주당 가격').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('comment').setDescription('설명').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('minratio').setDescription('최소 퍼센트').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('maxratio').setDescription('최대 퍼센트').setRequired(true),
		)
		.addNumberOption(option =>
			option
				.setName('correctioncnt')
				.setDescription('조정 주기(30분 * n)')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('conditionlist')
				.setDescription('조정퍼센트 (0.01/-0.06/-0.05/0.03/0.06)')
				.setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('dividend').setDescription('배당').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('passwd').setDescription('관리자 패스워드').setRequired(true),
		),

	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const name = interaction.options.getString('name');
			const type = interaction.options.getString('type');
			const value = interaction.options.getNumber('value');
			const comment = interaction.options.getString('comment');
			const minRatio = interaction.options.getNumber('minratio');
			const maxRatio = interaction.options.getNumber('maxratio');
			const correctionCnt = interaction.options.getNumber('correctioncnt');
			let conditionList = interaction.options.getString('conditionlist');
			const dividend = interaction.options.getNumber('dividend');
			const passwd = interaction.options.getString('passwd');

			const MAX_RATIO = 0.2;

			if (passwd !== secretKey.adminPw) {
				await interaction.reply({ content: '어드민 비밀번호가 다릅니다' });
				return;
			}

			conditionList = conditionList.split('/').map(value => parseInt(value, 10));
			if (conditionList.length !== 5) {
				await interaction.reply({
					content: '조정 퍼센트 입력형식이 이상합니다. 다시 입력해주세요.',
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
				});
				return;
			}

			/** DB Info */
			const result = await StockModel.addStock({
				name,
				type,
				value,
				comment,
				minRatio,
				maxRatio,
				correctionCnt,
				conditionList,
				dividend,
			});

			const content = result.code === 1 ? '등록완료!' : result.msg;

			await interaction.reply({ content });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
