const Gamble = require('./Gamble/Gamble');
const Stock = require('./Gamble/Stock');
const User = require('./Gamble/User');

/**
 * @typedef {import('./Coin')} Coin
 * @typedef {import('./Stock')} Stock
 * @typedef {import('./User')} User
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

class Game {
	/** @param {import('./Gamble/Gamble')} gamble */
	constructor(gamble) {
		this.gamble = gamble;
	}

	/**
	 * 유저 추가
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
}

const user1 = new User({ id: 'gun4930' });
const stock1 = new Stock({
	ratio: { min: -0.05, max: 0.05 },
	name: '무야호',
	value: 100000,
	type: 'stock',
	updateTime: 4,
	correctionCnt: 3,
});
const customGamble = new Gamble([user1], [], [stock1]);
const game = new Game(customGamble);

game.gamble.start();
