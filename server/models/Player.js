const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    socketId : String,
    score: {
        type:Number,
        default: 0
    },
    createdAt:{
        type : Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Player", playerSchema);