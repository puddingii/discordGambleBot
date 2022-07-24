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
 * @param {String} discordId
 */
Stock.statics.findBydiscordId = async function (discordId) {
	const userInfo = await this.findOne({ discordId });
	return userInfo;
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

/** 유저정보에 공부정보 추가 */
Stock.statics.addStudy = async function (discordId, studyInfo) {
	const user = await this.findOne({ discordId }).populate('studyList');
	if (!user) {
		throw new Error('User is not found.');
	}

	user.studyList.push(studyInfo);
	await user.save();

	return 1;
};

/** 유저정보에 Todo정보 추가 */
Stock.statics.addTodo = async function (discordId, todoInfo) {
	const user = await this.findOne({ discordId }).populate('todoList');
	if (!user) {
		throw new Error('User is not found.');
	}

	user.todoList.push(todoInfo);
	await user.save();

	return 1;
};

/**
 * Random id 생성 후 저장 및 return
 * @this import('mongoose').Model
 * @param {String} discordId
 */
Stock.statics.getRandomId = async function (discordId) {
	const user = await this.findOne({ discordId });
	if (!user) {
		throw new Error('User is not found.');
	}

	const randomString = Math.random().toString(36).slice(2);
	user.accessKey = randomString;
	await user.save();

	return randomString;
};

module.exports = mongoose.model('Stock', Stock);
