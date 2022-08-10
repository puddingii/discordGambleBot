module.exports = new (class {
	/**
	 * 세자리수마다 컴마 찍어주기
	 * @param {string | number} num
	 * @param {boolean} isRemoveDecimal
	 * @return {string}
	 */
	setComma(num, isRemoveDecimal) {
		if (!num) {
			return 0;
		}
		num = isRemoveDecimal ? Math.floor(Number(num)) : Number(num);
		num = num.toString();
		return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	}
})();
