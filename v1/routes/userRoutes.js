const express = require("express")
const router = express.Router()
const usercontroller = require("../controller/userController")
const sgmail = require("@sendgrid/mail")
const verifyToken = require("../../jwt/jwtVerify")
const upload = require("../../utils/multer.middelware") 

router.post("/signup",usercontroller.signup)
router.post("/login",usercontroller.login)
router.post("/forgotPassword",usercontroller.forgotPassword)
router.post("/createPassword",verifyToken,usercontroller.createPassword)
router.post("/editProfile",verifyToken,usercontroller.editProfile)
router.post("/petSignup",verifyToken,upload.fields([{name: "profileImage"}, {name: "coverImage"}]),usercontroller.addPet)
router.get("/home",verifyToken,usercontroller.userPet)
router.get("/pet",usercontroller.petInfo)
router.post("/editPet",upload.fields([{name: "newProfileImage"},{name: "newCoverImage"}]),usercontroller.editPetInfo)
router.post("/adminSignup",usercontroller.adminSignup)
router.post("/adminLogin",usercontroller.adminLogin)
router.get("/allUser",usercontroller.admin)
router.get("/getUser",usercontroller.userWithPets)
router.get("/allUserPets",usercontroller.allUserwithPets)
router.post("/userRestrict",usercontroller.restrictUser)

module.exports = router