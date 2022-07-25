const mongoose = require('mongoose');

const Stock = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true,
	},
	type: {
		type: String,
		default: 'stock',
	},
	value: {
		type: Number,
		default: 1000000,
	},
	comment: {
		type: String,
		default: '',
	},
	minRatio: {
		type: String,
		default: -0.5,
	},
	maxRatio: {
		type: String,
		default: 0.5,
	},
	updateTime: {
		type: Number,
		default: 4,
	},
	correctionCnt: {
		type: Number,
		default: 4,
	},
	correctionHistory: {
		type: Array,
		default: [],
	},
	conditionList: {
		type: Array,
		default: [0, -0.06, -0.04, 0.04, 0.06],
	},
	dividend: {
		type: Number,
		default: 0.005,
	},
});

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {'stock' | 'coin' | 'all'} type
 * @param {String} discordId
 */
Stock.statics.findAllList = async function (type) {
	const condition = type === 'all' ? {} : { type };
	const stockList = await this.find(condition);
	return stockList;
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {{userId: String, nickname?: String}}
 */
Stock.statics.findByWeb = async function (orOptions) {
	const orOptionList = [];
	Object.entries(orOptions).forEach(([key, value]) => {
		const obj = {};
		obj[key] = value;
		orOptionList.push(obj);
	});

	const userInfo = await this.findOne({ $or: orOptionList });
	return userInfo;
};

/** 유저정보에 채널 추가 */
Stock.statics.addChannel = async function (userInfo, channelInfo) {
	const user = await userInfo.populate('channelList');
	if (!user) {
		throw new Error('User is not found.');
	}
	if (user.channelList.find(dbChannel => dbChannel.channelId === channelInfo.channelId)) {
		return;
	}
	user.channelList.push(channelInfo);
	await user.save();

	return 1;
};

module.exports = mongoose.model('Stock', Stock);
