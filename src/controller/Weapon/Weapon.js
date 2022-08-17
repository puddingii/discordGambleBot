const ToolAbstract = require('./ToolAbstract');

module.exports = class Weapon extends ToolAbstract {
	#hitRatio;
	#missRatio;

	/**
	 * @param {import('./ToolAbstract').WeaponInfo & { bonusPower: number, hitRatio: number, missRatio: number}} weaponInfo
	 */
	constructor(weaponInfo) {
		super(weaponInfo);
		this.bonusPower = weaponInfo.bonusPower;
		this.#hitRatio = weaponInfo.hitRatio;
		this.#missRatio = weaponInfo.missRatio;
	}
};
