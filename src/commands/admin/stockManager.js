const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const {
	cradle: { StockModel, logger, secretKey },
} = require('../config/dependencyInjection');
const Stock = require('../controller/Gamble/Stock');
const Coin = require('../controller/Gamble/Coin');

module.exports = {
	/** selectbox interaction function */
	select: {
		/**
		 * @param {import('discord.js').SelectMenuInteraction} interaction
		 * @param {import('../controller/Game')} game
		 * @param {string} stockName
		 */
		async showStockModal(interaction, game, stockName) {
			const modal = new Modal()
				.setCustomId(`어드민-${stockName ? 'updateStock' : 'addStock'}`)
				.setTitle('주식 추가/업데이트');

			const nameType = new TextInputComponent()
				.setCustomId('nameType')
				.setLabel('주식이름/종류 (업데이트는 이름과 종류를 바꿀 수 없음)')
				.setStyle('SHORT');

			const value = new TextInputComponent()
				.setCustomId('value')
				.setLabel('1주당 가격')
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

			modal.addComponents(...actionRows);
			await interaction.showModal(modal);
		},
	},
	/** modal interaction function */
	modalSubmit: {
		/**
		 *
		 * @param {import('discord.js').SelectMenuInteraction} interaction
		 * @param {import('../controller/Game')} game
		 * @param {boolean} isNew
		 */
		async updateStock(interaction, game, isNew) {
			try {
				const [name, type] = interaction.fields.getTextInputValue('nameType').split('/');
				const value = Number(interaction.fields.getTextInputValue('value'));
				const [minRatio, maxRatio, dividend, correctionCnt] = interaction.fields
					.getTextInputValue('ratio')
					.split('/')
					.map(Number);
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

				const { code, message } =
					type === 'stock'
						? Stock.checkStockValidation(param)
						: Coin.checkStockValidation(param);
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
							content: `해당하는 이름의 ${
								type === 'stock' ? '주식' : '코인'
							}이 없습니다.`,
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
		},
	},
};
