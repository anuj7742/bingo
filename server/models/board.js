const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
    numbers: [[Number]],
    sum : Number
}) 

module.exports = mongoose.model('BingoBoard', boardSchema)