/**
 * @typedef {import('./Gamble/Coin')} Coin
 * @typedef {import('./Gamble/Stock')} Stock
 * @typedef {import('./Gamble/User')} User
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

module.exports = class Game {
	/** @param {import('./Gamble/Gamble')} gamble */
	constructor(gamble) {
		this.gamble = gamble;
	}

	/**
	 * 주식 추가
	 * @param {Stock | Coin} stock
	 */
	addGambleStock(stock) {
		return this.gamble.addStock(stock);
	}
	/**
	 * 주식/코인 추가
	 * @param {User} user
	 */
	addGambleUser(user) {
		return this.gamble.addUser(user);
	}
};

// const user1 = new User({ id: 'gun4930' });
// const stock1 = new Stock({
// 	ratio: { min: -0.05, max: 0.05 },
// 	name: '무야호',
// 	value: 100000,
// 	type: 'stock',
// 	updateTime: 4,
// 	correctionCnt: 3,
// });
// const customGamble = new Gamble([user1], [], [stock1]);
// const game = new Game(customGamble);

// game.gamble.start();

// const stock2 = new Stock({
// 	ratio: { min: -0.05, max: 0.05 },
// 	name: '무야호1',
// 	value: 100000,
// 	type: 'stock',
// 	updateTime: 4,
// 	correctionCnt: 3,
// });

// game.addGambleStock(stock2);
