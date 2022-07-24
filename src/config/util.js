module.exports = new (class {
	setComma(num) {
		if (typeof num === 'number') {
			num = num.toString();
		}
		if (!num) {
			return;
		}
		return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	}
})();
