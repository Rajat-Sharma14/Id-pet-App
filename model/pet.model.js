const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")
const petSchema = new mongoose.Schema({
    userId:{
        type:ObjectId
    },
    profileImage: {
        type:String
    },
    coverImage: {
        type:String
    },
    petName: {
        type: String
    },
    petGender: {
        type: String
    },
    petBread: {
        type: String
    },
    petChipNo:{
        type:String
    },
    date:{
        type:Date
    },
    noteAndInfo:{
        type:String
    }
})
const pet = mongoose.model("pet",petSchema)
module.exports= pet
