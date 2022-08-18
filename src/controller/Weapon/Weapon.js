const Game = require('../Game');
const Sword = require('./Sword');
/**
 * @typedef {import('./Sword')} Sword
 * @typedef {{ code: number, message?: string }} DefaultResult
 */
module.exports = class Weapon {
	constructor() {
		const section1 = Array.from({ length: 10 }, (v, i) => ({
			moneyRatio: 1.1,
			failRatio: 0.05 * i,
			destroyRatio: 0,
		}));
		this.swordInfo = {
			ratioList: [
				...section1,
				{ moneyRatio: 1.15, failRatio: 0.5, destroyRatio: 0 }, // 10 -> 11
				{ moneyRatio: 1.15, failRatio: 0.55, destroyRatio: 0 },
				{ moneyRatio: 1.15, failRatio: 0.6, destroyRatio: 0.006 },
				{ moneyRatio: 1.15, failRatio: 0.6, destroyRatio: 0.013 },
				{ moneyRatio: 1.15, failRatio: 0.65, destroyRatio: 0.014 }, // 14 -> 15
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.02 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.03 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.04 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.05 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.06 }, // 19 -> 20
				{ moneyRatio: 1.2, failRatio: 0.75, destroyRatio: 0.07 },
				{ moneyRatio: 1.2, failRatio: 0.75, destroyRatio: 0.07 },
				{ moneyRatio: 1.2, failRatio: 0.8, destroyRatio: 0.08 },
				{ moneyRatio: 1.2, failRatio: 0.85, destroyRatio: 0.09 },
				{ moneyRatio: 1.2, failRatio: 0.89, destroyRatio: 0.1 }, // 24 -> 25
			],
			value: 3000,
		};
	}

	/**
	 * @param {string} userId 디스코드 아이디
	 * @param {string} stockName 주식 이름
	 * @param {number} cnt 팔고살 주식 갯수, 파는거면 마이너스값
	 * @param {boolean} isFull
	 * @returns {DefaultResult & { cnt?: number, value?: number, money?: number }}
	 */
	enhanceWeapon(userId, type, isPrevent) {
		const userInfo = Game.getUser(userId);
		if (!userInfo) {
			return { code: 0, message: '유저정보가 없습니다' };
		}
		let myWeapon = userInfo.weaponList.find(weapon => weapon.type === type);
		if (!myWeapon) {
			switch (type) {
				case 'weapon':
					myWeapon = new Sword();
					break;
				default:
			}
			userInfo.weaponList.push(myWeapon);
		}

		const cost =
			this[`${type}Info`].ratioList.slice(0, myWeapon.curPower + 1).reduce((acc, cur) => {
				return acc * cur.moneyRatio;
			}, this[`${type}Info`].value) * (isPrevent ? 2 : 1);

		userInfo.updateMoney();
	}
};
