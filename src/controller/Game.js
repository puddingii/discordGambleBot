const User = require('./User');

/**
 * @typedef {import('./Gamble/Coin')} Coin
 * @typedef {import('./Gamble/Stock')} Stock
 * @typedef {import('./User')} User
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

module.exports = class Game {
	static instance;
	/** @type {import('./User')[]} */
	static userList;

	/**
	 * 디스코드 아이디를 가지고 유저클래스 찾기
	 * @param {{ discordId?: string, nickname?: string }} userInfo
	 */
	static getUser({ discordId, nickname }) {
		if (discordId) {
			return this.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return this.userList.find(userInfo => userInfo.nickname === nickname);
	}

	/**
	 * 싱글톤으로 관리
	 * @param {import('./Gamble/Gamble')} gamble
	 * @param {import('./User')[]} userList
	 * @param {import('./Weapon/Weapon')} weapon
	 */
	constructor(userList, gamble, weapon) {
		if (Game.instance) {
			// eslint-disable-next-line no-constructor-return
			return Game.instance;
		}
		this.gamble = gamble;
		this.weapon = weapon;
		Game.userList = userList;
		Game.instance = this;
	}

	/**
	 * 유저등록
	 * @param {{ id: string, nickname: string }} myInfo
	 * @return {DefaultResult}
	 */
	addUser(myInfo) {
		const isExistUser = this.getUser({ discordId: myInfo.id });
		if (isExistUser) {
			return { code: 0, message: '이미 있는 유저입니다.' };
		}
		const user = new User(myInfo);
		Game.userList.push(user);
		return { code: 1 };
	}

	/**
	 * 유저클래스 찾기
	 * @param {{ discordId?: string, nickname?: string }} userInfo
	 */
	getUser({ discordId, nickname }) {
		if (discordId) {
			return Game.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return Game.userList.find(userInfo => userInfo.nickname === nickname);
	}

	getUserList() {
		return Game.userList;
	}
};
