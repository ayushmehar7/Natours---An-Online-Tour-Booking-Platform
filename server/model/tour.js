const mongoose = require("mongoose")
const slugify = require("slugify")
const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"A Tour must have a name"],
        unique : true
    },
    duration : {
        type : Number,
        required : [true,"A Tour must have a duration"]
    },
    difficulty : {
        type : String,
        required : [true, "A Tour must have a difficulty"],
        enum : ["easy","medium","difficult"]
    },
    maxGroupSize : {
        type : Number,
        required : [true, "A Tour must have a maxGroupSize"]
    },
    ratingsQuantity : {
        type : Number,
        default : 0
    },
    ratingsAverage :{
        type : Number,
        default : 4.5
    },
    summary : {
        type : String,
        required : [true, "A Tour must have a summary"]
    },
    description : {
        type : String,
        required : [true,"A Tour must have a description"]
    },
    price : {
        type : Number,
        required : [true,"A Tour must have a price"]
    },
    imageCover : {
        type : String,
        default : "No Image Cover Provided"
    },
    images : {
        type : [String]
    },
    startDates : {
        type : [Date]
    },
    startLocation : {
        type: {
            type : String,
            default : "Point",
            enum : ["Point"]     
        },
        coordinates : [Number],
        address : String,
        description : String
    },
    locations : [{
            type: {
                type : String,
                default : "Point",
                enum : ["Point"]     
            },
            coordinates : [Number],
            address : String,
            description : String
    }],
    guides : [
        {
            type : mongoose.Schema.ObjectId,
            ref : "User"
        }
    ],
    slug : String,
    createdAt : {
        type : Date,
        default : Date.now()
    }
},{toJSON : {virtuals : true},toObject : {virtuals : true}}) 

tourSchema.virtual("reviews",{
    ref : "Review",
    foreignField : "tour",
    localField : "_id"
})

tourSchema.pre(/^find/, function(next){
    this.populate({
        path : "guides",
        select : "-__v -passwordChangedAt -passwordResetExpire -passwordResetToken"
    })
    
    next()
})

tourSchema.pre("save",function(next){
    this.slug = slugify(this.name,{lower : true})
    next()
})

tourSchema.index({price : 1, ratingsAverage : -1})
tourSchema.index({slug : 1})
tourSchema.index({startLocation : "2dsphere"})

const Tour = mongoose.model("Tour",tourSchema)

module.exports = Tour