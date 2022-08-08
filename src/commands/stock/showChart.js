const { SlashCommandBuilder } = require('@discordjs/builders');
const echarts = require('echarts');
const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const path = require('path');
const {
	cradle: { StockModel, logger, secretKey },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('차트보기')
		.setDescription('주식 or 코인 차트보기')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름');

			// In SSR mode the first parameter does not need to be passed in as a DOM object
			const chart = echarts.init(null, null, {
				renderer: 'svg', // must use SVG mode
				ssr: true, // enable SSR
				width: 500, // need to specify height and width
				height: 300,
			});

			// setOption as normal
			chart.setOption({
				xAxis: {
					data: [
						'2017-10-24',
						'2017-10-25',
						'2017-10-26',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
						'2017-10-27',
					],
				},
				yAxis: {},
				series: [
					{
						type: 'candlestick',
						data: [
							[20, 34, 10, 38],
							[40, 35, 30, 50],
							[31, 38, 33, 44],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
							[38, 15, 5, 42],
						],
					},
				],
			});

			// Output string
			const svgStr = chart.renderToSVGString();
			const svgFileName = `${Math.random().toString(36).substring(2, 12)}.svg`;
			const cuPath = path.resolve(__dirname, `../../../imgs/${svgFileName}`);
			fs.writeFileSync(cuPath, svgStr);
			const imgUrl = `${secretKey}/img/${svgFileName}`;

			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle(`Chart`)
				.setDescription('최근 12시간의 그래프')
				.addField('\u200B', '\u200B')
				.setThumbnail('https://i.imgur.com/AfFp7pu.png')
				.setImage(imgUrl)
				.setTimestamp();

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
