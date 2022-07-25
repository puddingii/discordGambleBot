/**
 * @typedef {import('./Stock') | import('./Coin')} stock
 * @typedef {{ stock: stock, cnt: number, value: number}} userStockInfo
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

module.exports = class User {
	#id;
	/**
	 * @param {{ id: string, nickname: string, money: number, stockList: userStockInfo[]}}
	 */
	constructor({ id, nickname, money, stockList }) {
		this.#id = id;
		this.nickname = nickname;
		this.money = money ?? 1000000;
		this.stockList = stockList ?? [];
	}

	/** 유저 디스코드 아이디 가져오기 */
	getId() {
		return this.#id;
	}

	/**
	 * 가지고 있는 name에 해당하는 주식 가져오기
	 * @param {string} name 유저이름
	 * @return {userStockInfo | undefined}
	 */
	getStock(name) {
		return this.stockList.find(stockInfo => {
			return stockInfo.stock.name === name;
		});
	}
	/**
	 * @param {Number} money
	 * @param {'stock' | 'coin'} type
	 * @return {DefaultResult}
	 */
	updateMoney(money, type) {
		if (this.money + money < 0) {
			return { code: 0, message: '돈이 부족함' };
		}
		let extraCommission = 1;
		/** 주식이고 파는 경우 수수료 2%를 땐다. */
		if (money < 0 && type === 'stock') {
			extraCommission = 0.98;
		}
		this.money += money * extraCommission;
		return { code: 1 };
	}
	/**
	 * 가지고 있는 주식 업데이트 하기(사고 팔때 사용)
	 * @param {stock} stock
	 * @param {number} cnt
	 * @return {DefaultResult}
	 */
	updateStock(stock, cnt) {
		const stockInfo = this.getStock(stock.name);
		/** 예전에 사고판적이 있을 때 */
		if (stockInfo && stockInfo.cnt + cnt >= 0) {
			const moneyResult = this.updateMoney(
				cnt * stockInfo.stock.value * -1,
				stockInfo.stock.type,
			);
			if (!moneyResult.code) {
				return moneyResult;
			}
			const totalValue = stockInfo.cnt * stockInfo.value + cnt * stockInfo.stock.value;
			const average = totalValue / (stockInfo.cnt + cnt);
			stockInfo.value = average;
			stockInfo.cnt += cnt;
			return { code: 1 };
		}
		/** 처음 살 때 */
		if (!stockInfo && cnt > 0) {
			this.stockList.push({ stock, cnt, value });
			return { code: 1 };
		}
		/** 파는데 숫자가 잘못될 경우 */
		if (stockInfo && stockInfo.cnt + cnt < 0) {
			return { code: 0, message: '가지고있는 갯수보다 많이 입력함.' };
		}
		return { code: 0, message: '없는 주식이거나 숫자 잘못 입력함' };
	}
};
