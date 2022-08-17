const mongoose = require('mongoose');

const Weapon = new mongoose.Schema({
	/** 타입 weapon or pickaxe */
	type: {
		type: String,
		required: true,
	},
	/** 터진수 */
	destroyCnt: {
		type: Number,
		default: 0,
	},
	/** 실패수 */
	failCnt: {
		type: Number,
		default: 0,
	},
	/** 성공수 */
	successCnt: {
		type: Number,
		default: 0,
	},
	/** 현재 강화된 정도(파워는 강화된 수 * 3) */
	curPower: {
		type: Number,
		default: 0,
	},
	/** 추가 파워 */
	bonusPower: {
		type: Number,
		default: 0,
	},
	/** 최대 적중률은 300% */
	hitRatio: {
		type: Number,
		default: 1,
	},
	/** 최대 회피율은 70% */
	missRatio: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('Weapon', Weapon);
