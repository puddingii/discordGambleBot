const Gamble = require('../controller/Gamble/Gamble');
const Game = require('../controller/Game');
const User = require('../controller/User');
const Stock = require('../controller/Gamble/Stock');
const Coin = require('../controller/Gamble/Coin');
const {
	cradle: { UserModel, StockModel },
} = require('../config/dependencyInjection');

module.exports = async () => {
	const stockAllList = await StockModel.find({});
	const { stockList, coinList } = stockAllList.reduce(
		(acc, cur) => {
			if (cur.type === 'stock') {
				const stock = new Stock({
					ratio: { min: cur.minRatio, max: cur.maxRatio },
					...cur._doc,
				});
				acc.stockList.push(stock);
			} else {
				const coin = new Coin({
					ratio: { min: cur.minRatio, max: cur.maxRatio },
					...cur._doc,
				});
				acc.coinList.push(coin);
			}
			return acc;
		},
		{ stockList: [], coinList: [] },
	);

	let userList = await UserModel.find({}).populate('stockList.stock');
	userList = userList.map(user => {
		/** stock정보에 해당하는 class 불러와서 init */
		const myList = user.stockList.reduce((acc, stockInfo) => {
			const {
				stock: { type, name },
				cnt,
				value,
			} = stockInfo;
			const list = type === 'stock' ? stockList : coinList;
			const stock = list.find(stock => stock.name === name);
			if (stock) {
				acc.push({ stock, cnt, value });
			}
			return acc;
		}, []);
		return new User({
			id: user.discordId,
			nickname: user.nickname,
			money: user.money,
			stockList: myList,
		});
	});

	const gamble = new Gamble(coinList, stockList);
	const game = new Game(gamble, userList);
	setInterval(() => {
		/** 12시간마다 컨디션 조정 */
		if (game.gamble.curTime % game.gamble.conditionPeriod === 0) {
			game.gamble.updateCondition();
		}
		game.gamble.curTime++;
		const { stockList, userList } = game.gamble.update();
		stockList.length && StockModel.updateStock(stockList);
		userList.length && UserModel.updateMoney(userList);
	}, 1000 * 60 * 30); // 맨 뒤의 값이 분단위임
	return game;
};
