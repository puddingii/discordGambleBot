const Condition = require('./ExternalOption/Condition');

/**
 * @typedef {import('./Coin')} Coin
 * @typedef {import('./Stock')} Stock
 * @typedef {import('./User')} User
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

module.exports = class Gamble {
	constructor(userList, coinList, stockList) {
		/** @type {Array<Coin>} */
		this.coinList = coinList ?? [];
		/** @type {Array<Stock>} */
		this.stockList = stockList ?? [];
		/** @type {Array<User>} */
		this.userList = userList ?? [];
		this.conditionRatioPerList = [5, 10, 10, 5];
		this.curCondition = 0;
		this.curTime = 0;
	}

	/**
	 * @param {Stock | Coin} stock
	 * @return {DefaultResult}
	 */
	addStock(stock) {
		const isExistUser = this[`${stock.type}List`].find(
			stockInfo => stockInfo.name === stock.name,
		);
		if (isExistUser) {
			return { code: 0, message: '이미 있는 유저입니다.' };
		}
		this.userList.push(user);
		return { code: 1 };
	}

	/**
	 * @param {User} user
	 * @return {DefaultResult}
	 */
	addUser(user) {
		const isExistUser = this.userList.find(userInfo => userInfo.getId() === user.getId());
		if (isExistUser) {
			return { code: 0, message: '이미 있는 유저입니다.' };
		}
		this.userList.push(user);
		return { code: 1 };
	}

	/**
	 * @param {string} userId 디스코드 아이디
	 * @param {string} stockName 주식 이름
	 * @param {number} cnt 팔고살 주식 갯수
	 * @returns {DefaultResult}
	 */
	buySellStock(userId, stockName, cnt) {
		const userInfo = this.userList.find(user => user.getId() === userId);
		if (!userInfo) {
			return { code: 0, message: '유저정보가 없습니다' };
		}
		const stockInfo = this.stockList.find(stock => stock.name === stockName);
		if (!stockInfo) {
			return { code: 0, message: '주식/코인정보가 없습니다' };
		}
		const stockResult = userInfo.updateStock(stockInfo, cnt);
		return stockResult;
	}

	/**
	 * 주식/코인 리스트에서 name에 해당하는 정보 가져오기
	 * @param {'stock' | 'coin'} type
	 * @param {string} name
	 * @returns {Stock | Coin | undefined}
	 */
	getStock(type, name) {
		return this[`${type}List`].find(stock => {
			return stock.name === name;
		});
	}

	/** Gamble 시간마다 업데이트 로직 시작 */
	start() {
		setInterval(() => {
			/** 6시간마다 컨디션 조정 */
			if (this.curTime % 12 === 0) {
				this.updateCondition();
			}
			this.curTime++;
			this.update();
		}, 1000 * 1);
	}

	/** 주식정보 갱신하기 */
	update() {
		this.stockList.forEach(stock => {
			const myStock = new Condition(stock);
			const ratio = myStock.getRandomRatio();
			stock.update(this.curTime, ratio, this.curCondition);
		});
		// this.coinList.forEach(coin => {
		// 	const ratio = coin.getRandomRatio();
		// 	coin.update(this.curTime, ratio);
		// });
	}

	/** Gamble의 condition 조정 */
	updateCondition() {
		const randIdx = Math.floor(Math.random() * 100) + 1;
		this.curCondition = 0;
		let perTotal = 0;
		this.conditionRatioPerList.some((ratio, idx) => {
			if (randIdx <= ratio + perTotal) {
				this.curCondition = idx;
				return true;
			}
			perTotal += ratio;
			return false;
		});
	}
};
