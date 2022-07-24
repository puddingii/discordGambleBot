const StockAbstract = require('./StockAbstract');

module.exports = class Stock extends StockAbstract {
	constructor(info) {
		super(info);
		this.dividend = info.dividend ?? 0.005;
		this.conditionList = info.conditionList ?? [0, -0.06, -0.04, 0.04, 0.06];
	}

	giveDividend() {}
	update(curTime, ratio, curCondition) {
		if (this.isUpdateTime(curTime)) {
			return;
		}
		const updRatio = ratio + this.conditionList[curCondition];

		this.value *= 1 + updRatio + this.calcCorrect();
		this.addCorrectionHistory(this.value, updRatio);
	}
};
