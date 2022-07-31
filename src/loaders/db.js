// getting-started.js
const mongoose = require('mongoose');
const {
	cradle: { secretKey, logger },
} = require('../config/dependencyInjection');

module.exports = async () => {
	try {
		const dbConnctionURL =
			secretKey.nodeEnv !== 'production'
				? 'mongodb://localhost:27017/discordGame'
				: `mongodb+srv://${secretKey.mongoId}:${secretKey.mongoPw}@selfmanagebotcluster.mvecp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
		await mongoose.connect(dbConnctionURL);
		logger.info('[DB] Connected to MongoDB');
		return { code: 1 };
	} catch (err) {
		logger.error(err);
		return { code: 0, message: err };
	}
};
