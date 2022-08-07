const StockAbstract = require('./StockAbstract');

module.exports = class Coin extends StockAbstract {
	update(curTime, ratio) {
		if (this.isUpdateTime(curTime)) {
			return { code: 0 };
		}

		this.beforeHistoryRatio = ratio;
		this.value *= 1 + ratio;
		return { code: 1 };
	}
};
