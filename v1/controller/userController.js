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

const userController = {
    async signup(req, res) {
        try {
            const isMailExist = await User.findOne({ email: req.body.email, })
            // console.log("isUserExist", isMailExist)
            const isphoneExist = await User.findOne({ contactphone: req.body.contactphone })
            // console.log("isphoneExist", isphoneExist)

            if (isMailExist) {
                return res.json({
                    message: message.Email_exist
                })
            }
            else if (isphoneExist) {
                return res.json({
                    message: message.Phone_exist
                })
            }
            else {
                const hash = await bcrypt.hash(req.body.password, 10)
                const hashpass = hash
                const newuser = new User({
                    ownername: req.body.ownername,
                    ownersurname: req.body.ownersurname,
                    contactphone: req.body.contactphone,
                    whatsapp: req.body.whatsapp,
                    email: req.body.email,
                    password: hashpass,

                })
                const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
                // console.log(otp)

                sgmail.setApiKey(process.env.SENDGRID_API_KEY);
                // console.log(process.env.SENDGRID_API_KEY)
                const msg = {
                    from: 'kapil.devherds@gmail.com',
                    to: req.body.email,
                    subject: 'Forgot password',
                    text: `Otp for verification ${otp}`
                };
                await sgmail.send(msg);
                const result = await newuser.save();
                const Token = jwt.sign({ id: result._id }, "secret", { expiresIn: "30min" })
                // User.token = Token

                res.status(201).json({
                    message: message.Otp_send,
                    result,
                    Token
                })

            }

        } catch (error) {
            console.error("Error in userSignup:", error);
            res.json({
                message: message.Error_msg, error
            })

        }
    },

    async login(req, res) {
        // console.log(req.body.email)
        try {
            // const mail = req.body.email
            // const password = req.body.password
            const user = await User.findOne({ email: req.body.email })
            // console.log(User)
            if (user.restricted === true) {
                return res.status(403).json({
                    message: message.Login_restriction_msg
                })
            }
            if (!user) {
                return res.send(message.Valid_mail_msg)
            }
            const comparePassword = await bcrypt.compare(req.body.password, user.password)
            if (!comparePassword) {
                return res.send(message.Wrong_password)
            }
            const Token = jwt.sign({ id: user._id }, "secret", { expiresIn: "30min" })
            return res.status(201).json({
                message: message.Login_success_msg,
                Token
            })

        } catch (error) {
            res.status(401).json({ error })
        }
    },
    async forgotPassword(req, res) {
        try {
            const user = await User.findOne({ email: req.body.email })
            // console.log("user", user)
            // console.log(req.body.email)

            if (!user) {
                return res.json({ success: false, message: message.Valid_mail_msg })
            }
            const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            // console.log(otp)

            sgmail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                from: 'kapil.devherds@gmail.com',
                to: req.body.email,
                subject: 'Forgot password',
                text: `Otp for verification ${otp}`
            };
            await sgmail.send(msg);
            await user.save()
            return res.status(201).json({
                message: message.Otp_send
            })
        } catch (error) {
            return res.status(404).json({ error })
        }
    },
    async createPassword(req, res) {
        try {
            const newPassword = req.body.password
            const hashNewPassword = await bcrypt.hash(newPassword, 10)
            const userId = req.user.id
            // console.log(userId)
            const user = await User.findByIdAndUpdate(userId, { password: hashNewPassword })
            // user.token = undefined
            // console.log(user)
            if (!user) {
                return res.send(message.User_notfound_msg)
            }
            user.token = undefined
            user.password = undefined
            return res.status(201).json({
                message: message.New_password_msg,
                result: user
            })

        } catch (error) {
            console.log(error)
            return res.status(404).json({
                message: message.Error_msg,
                error
            })
        }
    },
    async editProfile(req, res) {
        try {
            const newName = req.body.newname
            const newSurname = req.body.newSurname
            const newPhone = req.body.newPhone
            const newWhatsapp = req.body.newWhatsapp
            const newEmail = req.body.newEmail
            const newPassword = req.body.newPassword
            const hashNewPassword = await bcrypt.hash(newPassword, 10)
            const userId = req.user.id;
            console.log(userId)
            const user = await User.findOne({ _id: userId })
            console.log(user)
            // const comparepassword = await bcrypt.compare(newPassword,user.password)
            // console.log(comparepassword)
            const emailInUse = await User.findOne({ email: newEmail, _id: { $ne: userId } })
            const PhoneInUse = await User.findOne({ contactphone: newPhone, _id: { $ne: userId } })
            const whatsappInUse = await User.findOne({ whatsapp: newWhatsapp, _id: { $ne: userId } })

            if (emailInUse) {
                return res.status(402).json({
                    message: message.Email_exist
                })
            }
            else if (PhoneInUse) {
                return res.status(402).json({
                    message: message.Phone_exist
                })
            } else if (whatsappInUse) {
                return res.status(402).json({
                    message: message.Whatsapp_exist_msg
                })
            }
            if (newName !== user.ownername || newSurname !== user.ownersurname || newPhone !== user.contactphone ||
                newWhatsapp !== user.whatsapp || newEmail !== user.email || newPassword !== user.password) {
                const result = await User.findByIdAndUpdate(
                    userId,
                    {
                        ownername: newName,
                        ownersurname: newSurname,
                        contactphone: newPhone,
                        whatsapp: newWhatsapp,
                        email: newEmail,
                        password: hashNewPassword

                    },
                    {
                        new: true
                    }
                )
                return res.status(201).json({
                    message: message.Profile_update_msg,
                    result
                })
            }

        } catch (error) {
            res.status(401).json({
                message: message.Error_msg,
                error
            })

        }
    },
    async addPet(req, res) {
        try {
            const chipNo = randomString.generate({
                length: 6,
                charset: 'hex'
            })
            // console.log(chipNo)
            // const userId = req.user.id
            // console.log(userId)
            // console.log(req.files)
            const newPet = new pet({
                userId: req.user.id,
                profileImage: req.files.profileImage[0].filename,
                coverImage: req.files.coverImage[0].filename,
                petName: req.body.petName,
                petGender: req.body.petGender,
                petBread: req.body.petBread,
                petChipNo: chipNo,
                date: req.body.date,
                noteAndInfo: req.body.noteAndInfo

            })
            const result = await newPet.save()
            return res.status(201).json({
                message: message.Pet_added_msg,
                result
            })

        } catch (error) {
            return res.json({ error })
        }
    },
    async userPet(req, res) {
        try {

            const data = await pet.find({ userId: req.user.id })
            res.status(201).json({
                message: message.Data_fetch_success_msg,
                data
            })

        } catch (error) {
            res.json({ error })

        }
    },
    async petInfo(req, res) {
        try {
            const petid = req.body.petId
            const data = await pet.findOne({ _id: petid })
            return res.status(201).json({
                message: message.Data_fetch_success_msg,
                data
            })
        } catch (error) {
            res.status(401).json({
                error
            })
        }
    },
    async editPetInfo(req, res) {
        try {
            // console.log(req.body)
            const petId = await pet.find({ _id: req.body.id })
            // console.log(petId)
            if (petId) {
                const newProfileImage = req.files.newProfileImage[0].filename
                // console.log(newProfileImage)
                const newCoverImage = req.files.newCoverImage[0].filename
                const newPetName = req.body.newPetName
                const updatePet = await pet.findByIdAndUpdate(
                    petId,
                    {
                        profileImage: newProfileImage,
                        coverImage: newCoverImage,
                        petName: newPetName

                    },
                    {
                        new: true
                    }
                )
                return res.status(201).json({
                    message: message.Pet_update_msg,
                    updatePet
                })
            }
            else {
                res.send(message.Invalid_id_msg)
            }
        } catch (error) {
            res.status(401).json({
                error
            })

        }
    },
    async adminSignup(req, res) {
        try {
            const isMailExist = await Admin.findOne({ email: req.body.email })
            const isPhoneExist = await Admin.findOne({ email: req.body.phone })
            const hashPassword = await bcrypt.hash(req.body.password, 10)

            if (isMailExist) {
                return res.send(message.Email_exist)
            }
            else if (isPhoneExist) {
                return res.send(message.Phone_exist)
            }
            else {
                const admin = new Admin({
                    name: req.body.name,
                    phone: req.body.phone,
                    email: req.body.email,
                    password: hashPassword
                })
                const result = await admin.save()
                res.status(201).json({
                    message: message.Admin_added_msg,
                    result
                })
            }
        } catch (error) {
            return res.status(401).json({ error })

        }
    },
    async adminLogin(req, res) {
        try {
            const email = req.body.email
            const user = Admin.findOne({ email })
            if (!user) {
                return res.send(message.Invalid_user_msg)
            }

            const pass = bcrypt.compare(req.body.password, user.password)
            if (!pass) {
                return res.send(message.Wrong_password)
            }
            return res.status(201).json({
                message: message.Admin_login_msg
            })
        } catch (error) {
            res.status(401).json({ error })
        }
    },
    async admin(req, res) {
        try {
            const data = await User.find()
            res.json({
                message: message.Alluser_msg,
                data
            })
        } catch (error) {
            res.json({
                error
            })
        }
    },
    async userWithPets(req, res) {
        try {
            const _id = req.body.id
            const data = await User.findOne({ _id })
            if (!data) {
                return res.send(message.User_notFound_msg)
            }
            const petDetails = await pet.findOne({ userId: _id })
            if (!petDetails) {
                return res.send(message.NoPetAdded_msg)
            }
            return res.status(200).json({
                data,
                petDetails
            })

        } catch (error) {
            res.status(401).json({
                message: message.Error_msg,
                error
            })
        }
    },
    async allUserwithPets(req, res) {
        try {
            const data = await User.aggregate([
                {
                    $lookup: {
                        from: 'pets',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'userPets'
                    }
                }

            ])
            return res.status(200).json({
                // message: 'User with their pets',
                data
            })
        } catch (error) {
            res.status(401).json({
                error
            })
        }

    },
    async restrictUser(req, res) {
        try {
            const adminId = req.body.id
            const admin = await Admin.findOne({ _id: adminId })
            if (!admin) {
                return res.send("Only admin can access")
            }
            const user = await User.findOne({ _id: req.body.userId })

            if (user.restricted === false) {
                await User.updateOne({ _id: req.body.userId }, { restricted: true });
                return res.status(200).json({
                    message: 'This user is restricted'
                })
            } else if (user.restricted === true) {
                await User.updateOne({ _id: req.body.userId }, { restricted: false });
                return res.status(200).json({
                    message: 'This user is unblocked'
                })
            } else {
                return res.send("No user with this id")
            }


        }
        catch (error) {
            res.status(400).json({
                error
            })
        }

    }
}
module.exports = userController

// const userPets = await pet.aggregate([
//     {
//         $lookup: {
//             from: "user",
//             localfeild: "userId",
//             foreignField: "_id",
//             as: "user"
//         },
//     },
//     {
//         $unwind: "$user"
//     },
//     {
//         $project: {
//             petName: 1,
//             user:{
//             _id: 1,
//             ownername: 1,
//             email:1
//             }

//         }
//     }

// ]);
// console.log('Aggregated userPets:', userPets);

// return res.status(200).json({
//     message: "success",
//     userPets
// })

// function job() {
//     return new Promise((resolve, reject)=>{
//         setTimeout(()=>{
//             resolve('hello world')
//         },2000)
//     })
//     }
//     job().then((res)=>{
//         console.log(res)
//     })

function job(data) {
    return new Promise((resolve, reject) => {
        console.log(typeof data)
        if (typeof data !== 'number') {
            reject('error')
        } else if (data %2 === 0) {
            setTimeout(() => {
                resolve('even')
            }, 1000)
        } else {
            setTimeout(() => {
                resolve('odd')
            }, 2000)
        }

    })
}

job('12')
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)

    })
