require('regenerator-runtime');
const { createContainer, asValue } = require('awilix');
const logger = require('./logger');
const util = require('./util');
const User = require('../model/User');
const Stock = require('../model/Stock');
const secret = require('./secretKey');

const container = createContainer();

container.register({
	util: asValue(util),
	logger: asValue(logger),
	secretKey: asValue(secret),
	UserModel: asValue(User),
	StockModel: asValue(Stock),
});

module.exports = container;
