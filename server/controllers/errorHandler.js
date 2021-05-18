const AppError = require("../utils/appError")

const devError = (err,res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
          });
    }else{
        res.status(500).json({
            status : "error",
            message : "Something went wrong !",
        })
    }
}


const handleDBCastError = (err)=>{
    const message = `Invalid ${err.path} : ${err.value}`
    return (new AppError(message,400))
}


const handleDBDuplicateError = (err)=>{
    const message = ` A User already exists`
    return (new AppError(message,400))
}

const handleValidatorError = (err)=>{
    return (new AppError("Please check every field and try again!",400))
}

module.exports = (err,req,res,next)=>{
    // console.log(err)
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"
    let error = Object.assign({},err)
    error.message = err.message
    error.stack = err.stack
    if(error.kind === "ObjectId"){
        error = handleDBCastError(error)
    }else if(error.code === 11000){
        error = handleDBDuplicateError(error)
    }else if (error._message && (error._message.includes("validation failed") || error._message.includes("Validation failed"))){
         error = handleValidatorError(error)
    }else if (error.name === "JsonWebTokenError"){
        error = new AppError("Invalid Token, please Login again!",401);
    }else if (error.name === "TokenExpiredError"){
        error = new AppError("Session timed out, please login again!",401);
    }else if (error.message.startsWith("Unexpected token")){
        error = new AppError("Unauthorised, please Login or Sign Up!",401);
    }
    devError(error,res);
}