require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomString = require("randomstring");
const otpGenerator = require("otp-generator");
const sgmail = require("@sendgrid/mail");
const User = require("../../model/user");
const pet = require("../../model/pet.model");
const Admin = require("../../model/admin.model");
const message = require("../../utils/constant");

const adminContoller = {
    async addUserByAdmin(req, res) {
        try {
            const isMailExist = await User.findOne({ email: req.body.email });
            const isphoneExist = await User.findOne({
                contactphone: req.body.contactphone,
            });
            if (isMailExist) {
                return res.json({
                    message: message.Email_exist,
                });
            } else if (isphoneExist) {
                return res.json({
                    message: message.Phone_exist,
                });
            } else {
                const newuser = new User({
                    ownername: req.body.name,
                    ownersurname: req.body.surname,
                    contactphone: req.body.phone,
                    whatsapp: req.body.whatsapp,
                    email: req.body.email,
                });
                const result = await newuser.save();
                return res.status(201).json({
                    message: "New User Added",
                    result,
                });
            }
        } catch (error) {
            res.status(401).json({
                message: "Error found",
                error,
            });
        }
    },

    async getUserById(req, res) {
        try {
            const user = await User.find({ _id: req.body.id });
            return res.status(200).json({
                message: "user found",
                user,
            });
        } catch (error) {
            return res.status(401).json({
                error,
            });
        }
    },

    async editUserByAdmin(req, res) {
        try {
            const userId = req.query.id;
            // console.log(userId)
            // console.log(req,'req')
            const newName = req.body.ownername;
            const newSurname = req.body.ownersurname;
            const newPhone = req.body.contactphone;
            const newWhatsapp = req.body.whatsapp;
            const newEmail = req.body.email;
            // const user = await User.findOne({ _id: userId })
            // console.log(user, "usseerr")
            const isMailExist = await User.findOne({
                email: newEmail,
                _id: { $ne: userId },
            });
            // console.log(isMailExist, "asdfgdhdss")
            const isPhoneExist = await User.findOne({
                contactphone: newPhone,
                _id: { $ne: userId },
            });
            if (isPhoneExist) {
                return res.send({ message: message.Phone_exist });
            } else if (isMailExist) {
                return res.send({ message: message.Email_exist });
            }
            const editUser = await User.findByIdAndUpdate(
                userId,
                {
                    ownername: newName,
                    ownersurname: newSurname,
                    contactphone: newPhone,
                    whatsapp: newWhatsapp,
                    email: newEmail,
                },
                {
                    new: true,
                }
            );
            return res.status(201).json({
                message: message.Profile_update_msg,
                editUser,
            });
        } catch (error) {
            return res.status(401).json({
                message: message.Error_msg,
            });
        }
    },
};
module.exports = adminContoller;
