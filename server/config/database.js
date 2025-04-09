const mongoose = require("mongoose");
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Successfully Connected."))
    .catch((error) => {
        console.log("Database Connection Failed.");
        console.error(error);
    })
}