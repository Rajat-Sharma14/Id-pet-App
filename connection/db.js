const mongoose = require("mongoose")
module.exports.db = async () => {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/pet')
        console.log('Connected!');
    } catch (error) {
        console.error("Error connecting to the database:", error);

    }

}
