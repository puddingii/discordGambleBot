/**
 * @typedef {import('./Gamble/Coin')} Coin
 * @typedef {import('./Gamble/Stock')} Stock
 * @typedef {import('./Gamble/User')} User
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

module.exports = class Game {
	static instance;
	/** @type {import('./Gamble/User')[]} */
	static userList;

	/**
	 * 디스코드 아이디를 가지고 유저클래스 찾기
	 * @param {string} discordId
	 */
	static getUser(discordId) {
		return this.userList.find(userInfo => userInfo.getId() === discordId);
	}

	/**
	 * 싱글톤으로 관리
	 * @param {import('./Gamble/Gamble')} gamble
	 * @param {import('./Gamble/User')[]} userList
	 */
	constructor(gamble, userList) {
		if (Game.instance) {
			// eslint-disable-next-line no-constructor-return
			return Game.instance;
		}
		this.gamble = gamble;
		Game.userList = userList;
		Game.instance = this;
	}

	/**
	 * 유저등록
	 * @param {{ id: string, nickname: string }} myInfo
	 * @return {DefaultResult}
	 */
	addUser(myInfo) {
		const isExistUser = this.getUser(myInfo.id);
		if (isExistUser) {
			return { code: 0, message: '이미 있는 유저입니다.' };
		}
		const user = new User(myInfo);
		Game.userList.push(user);
		return { code: 1 };
	}

	/**
	 * 디스코드 아이디를 가지고 유저클래스 찾기
	 * @param {string} discordId
	 */
	getUser(discordId) {
		return Game.userList.find(userInfo => userInfo.getId() === discordId);
	}

	getUserList() {
		return Game.userList;
	}
};
