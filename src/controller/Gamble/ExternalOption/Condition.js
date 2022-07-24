module.exports = class Condition {
	/**
	 * @param {import('../Stock').default} stock
	 */
	constructor(stock) {
		this.strengthList = [-0.01, 0, 0.01];
		this.stock = stock;
	}

	getRandomRatio() {
		const randomRatio = this.stock.getRandomRatio();
		const strengthIdx = Math.floor(Math.random() * this.strengthList.length);

		return randomRatio + this.strengthList[strengthIdx];
	}
};
