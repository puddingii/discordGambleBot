const StockAbstract = require('./StockAbstract');

module.exports = class Stock extends StockAbstract {
	constructor(info) {
		super(info);
		this.dividend = info.dividend ?? 0.005;
		this.conditionList = info.conditionList ?? [0, -0.06, -0.04, 0.04, 0.06];
	}

	update(curTime, ratio, curCondition) {
		if (this.isUpdateTime(curTime)) {
			return { code: 0 };
		}
		const updRatio = ratio + this.conditionList[curCondition];
		const correctRatio = updRatio + this.calcCorrect();
		this.value *= 1 + correctRatio;
		this.beforeHistoryRatio = correctRatio;
		this.addCorrectionHistory(this.value, updRatio);
		return { code: 1 };
	}
};
