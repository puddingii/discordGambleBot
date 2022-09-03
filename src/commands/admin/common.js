const {
	MessageActionRow,
	MessageSelectMenu,
	Modal,
	TextInputComponent,
} = require('discord.js');

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
	/**
	 * 모달객체 생성
	 * @param {{ id: string, title: string }} modalInfo
	 * @param {{[id: string]: { id: string, label: string, style?: 'SHORT' | 'PARAGRAPH', value?: '' }}} inputBoxInfo key값은 customId로 지정된다.
	 */
	getModal(modalInfo, inputBoxInfo) {
		const inputBoxList = Object.keys(inputBoxInfo).map(key => ({
			id: key,
			...inputBoxInfo[key],
		}));

		const modal = new Modal().setCustomId(modalInfo.id).setTitle(modalInfo.title);

		const actionRows = inputBoxList.map(inputBox => {
			return new MessageActionRow().addComponents(
				new TextInputComponent()
					.setCustomId(inputBox.id)
					.setLabel(inputBox.label)
					.setStyle(inputBox.style ?? 'SHORT')
					.setValue(inputBox.value ?? ''),
			);
		});

		modal.addComponents(...actionRows);
		return modal;
	},
};
