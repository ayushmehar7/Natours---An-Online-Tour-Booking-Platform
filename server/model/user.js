const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"A User must have a Name"]
    },
    email : {
        type : String,
        required : [true,"A User must have an E-mail"],
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : [true,"A User must have a password"],
        minlength : 8,
        select : false
    },
    role :{
        type : String,
        enum : ["admin","user","guide","lead-guide"],
        default : "user" 
    },
    photo : {
        type : String,
        default : "default.jpg"
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpire : Date
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()


    this.password = await bcrypt.hash(this.password,12)
    next() 
})

userSchema.pre("save",function(next){
    if(!this.isModified("password") || this.isNew) return next()

    this.passwordChangedAt = Date.now()-1000;
    next();
})

userSchema.methods.validatePassword = async function(inputPassword,userPassword){
    return await bcrypt.compare(inputPassword,userPassword)
}

userSchema.methods.changedPassword = function(JWTTime){
    if(this.passwordChangedAt){
        const timeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
        return JWTTime < timeStamp
    }
    return false;
}

userSchema.methods.generatePasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.passwordResetExpire = Date.now() + 10*60*1000
    return resetToken
}


const User = mongoose.model("User",userSchema)

module.exports = User