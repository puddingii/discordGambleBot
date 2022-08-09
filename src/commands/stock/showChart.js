const { SlashCommandBuilder } = require('@discordjs/builders');
const echarts = require('echarts');
const { MessageEmbed } = require('discord.js');
const sharp = require('sharp');
const {
	cradle: { logger },
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

			// 차트 이미지 생성
			const svgStr = chart.renderToSVGString();
			const imageBuf = await sharp(Buffer.from(svgStr)).jpeg().toBuffer();

			const embedBox = new MessageEmbed();
			embedBox
				.setColor('#0099ff')
				.setTitle(`차트`)
				.setDescription('그래프')
				.addFields([{ name: '\u200B', value: '\u200B' }])
				.setTimestamp();

			await interaction.reply({ files: [imageBuf] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
