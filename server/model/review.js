const mongoose = require("mongoose")
const Tour = require("./tour")

const reviewSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : [true,"A Review must be made by a User"]
    },
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : "Tour",
        required : [true,"A Review must be on a Tour"]
    },
    review : {
        type : String,
        required : [true,"A Review must contain some text"],
    },
    rating : {
        type : Number,
        min : 1,
        max : 5,
        required : [true,"You must provide a Rating"],
        set : value => (Math.round(value*10))/10
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

reviewSchema.index({tour : 1,user : 1},{unique : true})

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path : "user",
        select : "name photo"
    })
    this.populate({
        path : "tour",
        select : "name imageCover summary"
    })
    next()
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match : {tour : tourId} 
        },
        {
            $group : {
                _id : "$tour",
                nRating : {$sum : 1},
                avgRating : {$avg : '$rating'}
            }
        }
    ])
   if(stats.length > 0){ await Tour.findByIdAndUpdate(tourId,{ratingsQuantity : stats[0].nRating,ratingsAverage : stats[0].avgRating})}
   else{await Tour.findByIdAndUpdate(tourId,{ratingsQuantity : 0,ratingsAverage : 4.5})}
}

reviewSchema.post("save",function(){
    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model("Review",reviewSchema)

module.exports = Review