const _ = require('lodash');

module.exports = class StockAbstract {
	#id;
	#ratio;

	/**
	 * @param {Object} stockInfo
	 * @param {{min: number, max: number}} stockInfo.ratio
	 * @param {string} stockInfo.name
	 * @param {number} stockInfo.value
	 * @param {'stock' | 'coin'} stockInfo.type
	 * @param {number} stockInfo.updateTime
	 * @param {number} stockInfo.correctionCnt
	 */
	constructor({ ratio, name, value, type, updateTime, correctionCnt }) {
		this.#ratio = ratio;
		this.name = name;
		this.value = value;
		this.type = type;
		this.updateTime = updateTime;
		this.correctionCnt = correctionCnt ?? 4;
		this.correctionHistory = [];
	}

	/**
	 * @param {Number} value
	 * @param {Number} ratio
	 */
	addCorrectionHistory(value, ratio) {
		this.correctionHistory.push({ value, ratio });
	}
	calcCorrect() {
		if (this.correctionHistory.length !== this.correctionCnt) {
			return 0;
		}
		const corHistory = this.getCorrectionHistory();
		const sumRatio = corHistory.reduce((acc, cur) => acc + cur.ratio, 0);
		const signal = sumRatio > 0 ? -1 : 1;

		const ratio =
			Math.abs(sumRatio) > 0.05 * this.correctionCnt
				? 0.05 * this.correctionCnt * signal
				: 0;
		this.removeAllCorrectionHistory();
		return ratio;
	}
	getCorrectionHistory() {
		return this.correctionHistory;
	}
	getId() {
		return this.#id;
	}
	getRandomRatio() {
		const curRatio = this.getRatio();
		const volatility = curRatio.max - curRatio.min;

		const updPercent = _.round(volatility * Math.random(), 2) + curRatio.min;
		return updPercent;
	}
	getRatio() {
		return this.#ratio;
	}
	isUpdateTime(curTime) {
		return curTime % this.updateTime !== 0;
	}
	removeAllCorrectionHistory() {
		this.correctionHistory = [];
	}

	setratio(ratio) {
		this.#ratio = ratio;
	}
};
