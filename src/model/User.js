const mongoose = require('mongoose');
const StockModel = require('./Stock');

const User = new mongoose.Schema({
	discordId: {
		type: String,
		unique: true,
		required: true,
	},
	nickname: {
		type: String,
		unique: true,
		required: true,
	},
	money: {
		type: Number,
		default: 1000000,
	},
	stockList: [
		{
			stock: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Stock',
			},
			cnt: {
				type: Number,
				default: 0,
			},
			value: {
				type: Number,
				required: true,
			},
		},
	],
});

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {string} discordId
 */
User.statics.findByDiscordId = async function (discordId) {
	const userInfo = await this.findOne({ discordId });
	return userInfo;
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {string} discordId
 * @param {{ name: string, cnt: string, value: number, money: number }} updStockInfo
 */
User.statics.updateStock = async function (discordId, updStockInfo) {
	const userInfo = await this.findOne({ discordId }).populate('stockList.stock');
	if (!userInfo) {
		return { code: 0, message: '[DB]유저정보를 찾을 수 없습니다.' };
	}

	const myStock = userInfo.stockList.find(myStock => {
		return myStock.stock.name === updStockInfo.name;
	});

	if (myStock) {
		myStock.value = updStockInfo.value;
		myStock.cnt = updStockInfo.cnt;
	} else {
		const stock = await StockModel.findByName(updStockInfo.name);
		if (!stock) {
			return { code: 0, message: '[DB]주식정보를 찾을 수 없습니다.' };
		}
		userInfo.stockList.push({
			stock,
			value: updStockInfo.value,
			cnt: updStockInfo.cnt,
		});
	}
	userInfo.money = updStockInfo.money;

	await userInfo.save();
	return { code: 1 };
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {string} discordId
 * @param {number} money
 */
User.statics.updateMoney = async function (discordId, money) {
	const userInfo = await this.findOne({ discordId });
	if (!userInfo) {
		return { code: 0, message: '[DB]유저정보를 찾을 수 없습니다.' };
	}
	userInfo.money = money;
	await userInfo.save();
	return { code: 1 };
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {{userId: String, nickname?: String}}
 */
User.statics.findByWeb = async function (orOptions) {
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
User.statics.addChannel = async function (userInfo, channelInfo) {
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
User.statics.addStudy = async function (discordId, studyInfo) {
	const user = await this.findOne({ discordId }).populate('studyList');
	if (!user) {
		throw new Error('User is not found.');
	}

	user.studyList.push(studyInfo);
	await user.save();

	return 1;
};

/** 유저정보에 Todo정보 추가 */
User.statics.addTodo = async function (discordId, todoInfo) {
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
User.statics.getRandomId = async function (discordId) {
	const user = await this.findOne({ discordId });
	if (!user) {
		throw new Error('User is not found.');
	}

	const randomString = Math.random().toString(36).slice(2);
	user.accessKey = randomString;
	await user.save();

	return randomString;
};

module.exports = mongoose.model('User', User);
