const express = require("express")
const app = express()
const toursRouter = require("./routes/tours")
const userRouter = require("./routes/user")
const reviewRouter = require("./routes/reviews")
const bookingsRouter = require("./routes/bookings")
const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorHandler")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const hpp = require("hpp")
const xss = require("xss-clean")
const cors = require("cors")
const morgan = require("morgan")

const limit = rateLimit({
    max : 100,
    windowMs : 60*60*1000,
    message : "Too many requests from this IP, please try again in an hour!"
})  

app.use(cors())

app.use(helmet())

app.use(express.json())



app.use(hpp())
app.use(xss())

app.use(morgan("tiny"))
// app.use("/api",limit)

app.use("/api/tours",toursRouter)
app.use("/api/users",userRouter)
app.use("/api/reviews",reviewRouter)
app.use("/api/bookings",bookingsRouter)

app.all("*",(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
})


app.use(globalErrorHandler)

module.exports = app