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
		if (money > 0 && type === 'stock') {
			extraCommission = 0.98;
		}
		this.money += money * extraCommission;
		return { code: 1 };
	}
	/**
	 * 가지고 있는 주식 업데이트 하기(사고 팔때 사용)
	 * @param {stock} stock
	 * @param {number} cnt isFull이 true인 경우 매수는 양수값 매도는 음수값을 넣어줘야함
	 * @param {boolean} isFull
	 * @return {DefaultResult}
	 */
	updateStock(stock, cnt, isFull) {
		const myStock = this.getStock(stock.name);
		if (isFull) {
			cnt = cnt > 0 ? Math.floor(this.money / stock.value) : myStock?.cnt ?? 0 * -1;
		}
		if (!cnt) {
			return { code: 0, message: '돈이 부족하거나 갯수 입력값이 잘못됨.' };
		}
		/** 파는데 숫자가 잘못될 경우 */
		if ((myStock && myStock.cnt + cnt < 0) || (!myStock && cnt < 0)) {
			return { code: 0, message: '가지고있는 갯수보다 많이 입력함.' };
		}

		const totalMoney = cnt * stock.value;
		const updateResult = this.updateMoney(totalMoney * -1, stock.type);
		if (!updateResult.code) {
			return updateResult;
		}
		/** 예전에 사고판적이 있을 때 */
		if (myStock) {
			const averageValue = Math.floor(
				(myStock.cnt * myStock.value + totalMoney) / (myStock.cnt + cnt),
			);
			myStock.value = myStock.cnt + cnt !== 0 ? averageValue : 0;
			myStock.cnt += cnt;
			return { code: 1 };
		}

		/** 처음 살 때 */
		if (!myStock) {
			this.stockList.push({ stock, cnt, value: stock.value });
			return { code: 1 };
		}

		return { code: 0, message: '없는 주식이거나 숫자 잘못 입력함' };
	}
};
