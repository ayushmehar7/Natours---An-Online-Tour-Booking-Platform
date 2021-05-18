const asyncErrorHandler = require("../utils/asyncErrorHandler")
exports.deleteOne = (Model) =>(
    asyncErrorHandler(async(req,res,next)=>{
        const data = await Model.findByIdAndDelete(req.params.id);
        if(!data){
            return next(new AppError("No Tour found with the provided ID",404))
        }
        res.status(204).json({
            status : "success",
            data : null
        })       
    })
)

exports.createDoc = (Model) =>(
    asyncErrorHandler(async (req,res,next)=>{
        const newDoc = await Model.create(req.body) 
        res.status(201).json({
            status : "success",
            data : newDoc
        })  
    })
)

exports.updateDoc = (Model) =>(
    asyncErrorHandler(async (req,res,next)=>{
        const updatedDoc = await Model.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators : true
        })
        if(!updatedDoc){
            return next(new AppError(`No ${Model} found with the provided ID`,404))
        }
        res.status(200).json({
            status : "success",
            data : updatedDoc
        })
    })
)