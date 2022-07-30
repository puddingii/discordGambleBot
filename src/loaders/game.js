const Game = require('../controller/Game');

module.exports = () => {
	const game = new Game();
	return game;
};
