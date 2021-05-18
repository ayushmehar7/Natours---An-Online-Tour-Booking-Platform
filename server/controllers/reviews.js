const Review = require("../model/review")
const asyncErrorHandler = require("../utils/asyncErrorHandler")
const AppError = require("../utils/appError")
const factory = require("./factoryHandlers")


exports.getAllReviews = asyncErrorHandler(async (req,res,next)=>{
    let filter = {}
    if(req.params.tourId) filter.tour = req.params.tourId
    const reviews = await Review.find(filter)
    res.status(200).json({
        status : "success",
        data : reviews
    })
})

exports.addReview = asyncErrorHandler(async (req,res,next)=>{
    req.body.user = req.user._id
    req.body.tour = req.params.tourId
    const newReview = await Review.create(req.body)
    res.status(201).json({
        status : "success",
        data : newReview
    })
})

exports.editReview = factory.updateDoc(Review)
exports.deleteReview = factory.deleteOne(Review)

exports.getReviewsFromUser = asyncErrorHandler(async(req,res,next)=>{
    const reviews = await Review.find({user : req.user._id})
    res.status(200).json({
        status : "success",
        reviews
    })
})