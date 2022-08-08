const dotenv = require('dotenv');
const path = require('path');

const envPath =
	process.env.NODE_ENV === 'development' ? '../../.env.local' : '../../.env';
dotenv.config({ path: path.resolve(__dirname, envPath) });

module.exports = {
	botToken: process.env.BOT_TOKEN,
	nodeEnv: process.env.NODE_ENV,
	mongoId: process.env.MONGO_ID,
	mongoPw: process.env.MONGO_PW,
	clientId: process.env.CLIENT_ID,
	guildId: process.env.GUILD_ID,
	guildId2: process.env.GUILD_ID2,
	adminPw: process.env.ADMIN_PW,
	stockUpdateTime: parseInt(process.env.STOCK_UPDATE_TIME, 10),
	imgServer: process.env.IMG_SERVER,
};
