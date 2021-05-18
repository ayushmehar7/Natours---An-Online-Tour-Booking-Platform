const User = require("../model/user")
const jwt = require("jsonwebtoken")
const {promisify} = require("util")
const crypto = require("crypto")
const asyncErrorHandler = require("../utils/asyncErrorHandler")
const AppError = require("../utils/appError")
const sendmail = require("../utils/email")




const filterFields = (Obj,...fields) =>{
    let newObj = {...Obj}
    const keys = Object.keys(newObj)
    keys.forEach(el => {
        if(!fields.includes(el)){
            delete newObj[el]
        }
    })
    return newObj
}

const sendJWT = (user,statusCode,res)=>{
    const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN})
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly : true
    }
    user.password = undefined
    res.cookie("jwt",token,cookieOptions);
    res.status(statusCode).json({
        status : "success",
        token : token,
        data : user
    })
}


exports.signUp= asyncErrorHandler(async (req,res,next) =>{
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    });
    sendJWT(newUser,201,res);
})



exports.login = asyncErrorHandler(async (req,res,next) =>{
    const {email,password} = req.body   
    if(!email || !password){
        return next(new AppError("Enter E-mail and Password!",400))
    } 
    let user = await User.findOne({email : email})
    let correct = false
    if(user){
        user = await User.findOne({email : email}).select("+password")
        correct = await user.validatePassword(password,user.password)
    }
    if(!user || !correct){
        return next(new AppError("Incorrect E-mail or Password",401))
    }
    sendJWT(user,200,res);
})

exports.protectedRoute = asyncErrorHandler(async (req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token){
        return (next(new AppError("Unauthorised",401)));
    }
    const decoded_id = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    const user = await User.findById(decoded_id.id);
    if(!user){
        return (next(new AppError("User does not exist!, please log in again!",401)))
    }
    if(user.changedPassword(decoded_id.iat)){
        return (next(new AppError("User recently changed the password, please login again!",401)))
    }
    req.user = user
    next()  
})


exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("You do not have the permission to perform this action!",403))
        }
        next()
    }
}

exports.forgotPassword = asyncErrorHandler(async(req,res,next)=>{
    const user = await User.findOne({email : req.body.email})
    if(!user){
        return next(new AppError("No User found with the given ID!",404));
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save({validateBeforeSave : false});
    const message = `Your reset Token : ${resetToken}`
    try{
        await sendmail({
            email : user.email,
            subject : "Your password reset token (valid for 10 minutes)",
            message : message
        })  
        res.status(200).json({
            status : "success",
            message : "Token sent to user email!"
        })
    }catch(err){
        console.log("cannot send e-mail",err)
        user.passwordResetToken = undefined
        user.passwordResetExpired = undefined
        await user.save({validateBeforeSave : false})
        return next(new AppError("There was an error sending the email. Try again later!",500))
    }
})

exports.resetPassword = asyncErrorHandler(async(req,res,next)=>{
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({passwordResetToken : hashedToken,passwordResetExpire : {$gt : Date.now()}})
  if(!user){
      return next(new AppError("Token is invalid or has expired, please try again!",400))
  }
  user.password = req.body.password
  user.passwordResetToken = undefined
  user.passwordResetExpire = undefined
  await user.save()
  sendJWT(user,200,res)
})

exports.updatePassword = asyncErrorHandler(async (req,res,next)=>{
    const {password,newPassword} = req.body
    const user = await User.findById(req.user.id).select("+password")
    const correct = await user.validatePassword(password,user.password)
    if(!user || !correct){
        return next(new AppError("Invalid Email or Password, please  try again!",401))
    }
    user.password = newPassword
    await user.save();
    sendJWT(user,200,res);
})

exports.updateUser = asyncErrorHandler(async (req,res,next)=>{
    const toUpdateFeilds = filterFields(req.body,"name","email","photo")
    if(req.file) toUpdateFeilds.photo = req.file.filename    
    const updatedUser = await User.findByIdAndUpdate(req.user._id,toUpdateFeilds,{new : true,runValidators : true});
    res.status(200).json({
        status : "success",
        data : updatedUser
    })
})

exports.deleteUser = asyncErrorHandler(async (req,res,next)=>{
    const user = await User.findByIdAndDelete(req.user._id);
    res.status(204).json({
        status  : "success",
        data : null
    })
})

exports.getMe = asyncErrorHandler(async (req,res,next)=>{
    const user = req.user;
    res.status(200).json({
        status : "success",
        data : user
    })
})