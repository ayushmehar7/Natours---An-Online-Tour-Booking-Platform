const dotenv = require("dotenv")
const mongoose = require("mongoose")

process.on("uncaughtException",err=>{
    console.log(err.name,err.message)
    console.log(err.stack)
    console.log("Uncaught Exception!, Shutting Down")
    process.exit(1);
})

dotenv.config({
    path : "./config.env"
})

const DB = process.env.DATABASE.replace("<PASSWORD>",process.env.DATABASE_PASSWORD)
mongoose.connect(DB,{useNewUrlParser : true,useCreateIndex : true,useFindAndModify : false,useUnifiedTopology: true})
.then(()=>{
    console.log("Successfully connected to Database!")
}).catch((err)=>{
    console.log("Cannot connect to the Database",err)
})

const app = require("./app")


const server = app.listen(process.env.PORT,()=>{
    console.log(`Server started at port ${process.env.PORT}....`);
})

process.on("unhandledRejection", err=>{
    console.log(err.name,err.message)
    console.log("Shutting down the server !!")
    server.close(()=>{
        process.exit(1);
    })
})

