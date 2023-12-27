
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    ownername: {
        type: String
    },
    ownersurname: {
        type: String
        
    },
    contactphone: {
        type: Number
    },
    whatsapp: {
        type: Number
    },
    email: {
        type: String,
        // lowercase: true,
        // trim: true
    },
    password: {
        type: String
    },
    restricted:{
        type:Boolean
    }
})
const User = mongoose.model("user", userSchema)
module.exports = User