require('dotenv').config()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const randomString = require("randomstring")
const otpGenerator = require("otp-generator")
const sgmail = require("@sendgrid/mail")
const User = require("../../model/user")
const pet = require('../../model/pet.model')
const Admin = require('../../model/admin.model')
const message = require('../../utils/constant')

const adminContoller = {
    async editUserByAdmin(req, res) {
        try {
            const newName = req.body.ownername
            const newSurname = req.body.ownersurname
            const newPhone = req.body.contactphone
            const newWhatsapp = req.body.whatsapp
            const newEmail = req.body.email
            const userId = req.user.id
            const editUser = await User.findByIdAndUpdate(
                userId,
                {
                    ownername: newName,
                    ownersurname: newSurname,
                    contactphone: newPhone,
                    whatsapp: newWhatsapp,
                    email: newEmail
                },
                {
                    new: true
                })
            res.status(201).json({
                message: message.Profile_update_msg,
                editUser
            })
        } catch (error) {
            res.status(401).json({
                message: message.Error_msg
            })

        }

    }

}
module.exports = adminContoller