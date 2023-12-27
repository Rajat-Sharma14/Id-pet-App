const mongoose = require("mongoose")
const adminSchema = new mongoose.Schema({
    name:{
        type:String
    },
    phone:{
        type:Number
    },
    email:{
        type:String
    },
    password:{
        type:String
    }
})
const Admin = mongoose.model("admin",adminSchema)
module.exports = Admin