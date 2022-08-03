const StockAbstract = require('./StockAbstract');

module.exports = class Coin extends StockAbstract {
	update(curTime, ratio) {
		if (this.isUpdateTime(curTime)) {
			return;
		}

		this.beforeHistoryRatio = ratio;
		this.value *= 1 + ratio;
	}
};
