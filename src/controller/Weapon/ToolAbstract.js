/**
 * Tool Abstract Constructor params
 * @typedef {Object} WeaponInfo
 * @property {number} destroyCnt 파괴 카운트
 * @property {number} failCnt 실패 카운트
 * @property {number} successCnt 성공 카운트
 * @property {number} curPower 현재 강화된 정도
 */

module.exports = class ToolAbstract {
	/** @param {WeaponInfo} */
	constructor({ destroyCnt, failCnt, successCnt, curPower }) {
		this.destroyCnt = destroyCnt;
		this.failCnt = failCnt;
		this.successCnt = successCnt;
		this.curPower = curPower;
	}
};
