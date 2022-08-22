const mongoose = require('mongoose');

const Weapon = new mongoose.Schema();

module.exports = mongoose.model('Weapon', Weapon);
