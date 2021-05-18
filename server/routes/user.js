const express = require("express")
const router = express.Router();
const userController = require("../controllers/user")
const multer = require("multer")
const upload = multer({dest :`${__dirname}/../../client/public/img/users`})

router.route("/signup")
.post(userController.signUp)


router.route("/login")
.post(userController.login);

router.route("/forgotpassword")
.post(userController.forgotPassword)

router.route("/resetpassword/:token")
.patch(userController.resetPassword)

router.use(userController.protectedRoute)

router.route("/updatepassword")
.patch(userController.updatePassword)

router.route("/updateuser")
.patch(upload.single("photo"),userController.updateUser)

router.route("/deleteuser")
.delete(userController.deleteUser)

router.route("/getMe")
.get(userController.getMe)

module.exports = router;