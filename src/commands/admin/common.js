const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
	getNewSelectMenu() {
		return new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId('어드민-main')
				.setPlaceholder('Nothing selected')
				.addOptions([
					{
						label: '주식추가',
						description: '주식추가',
						value: 'showAddStockModal',
					},
					{
						label: '주식정보업데이트',
						description: '주식정보 강제 업데이트',
						value: 'selectStock',
					},
					{
						label: '돈기부',
						description: '돈 주는 기능',
						value: 'giveMoney',
					},
				]),
		);
	},
};
