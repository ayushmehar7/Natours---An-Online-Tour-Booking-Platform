const Tour = require("../model/tour")
const AppError = require("../utils/appError")
const asyncErrorHandler = require("../utils/asyncErrorHandler")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Booking = require("../model/bookings")

exports.getCheckoutSession = asyncErrorHandler(async (req,res,next)=>{
    const tour = await Tour.findById(req.params.tourId)
    const session = await stripe.checkout.sessions.create({
        payment_method_types : ["card"],
        success_url : `http://localhost:3000/confirmBooking/${req.params.tourId}/${tour.price}`,
        cancel_url : `http://localhost:3000/tours/${req.params.tourId}`,
        customer_email : req.user.email,
        client_reference_id : req.params.tourId,
        line_items : [
            {
                name : `${tour.name} Tour`,
                description : tour.summary,
                images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount : tour.price*100,
                currency : "usd",
                quantity : 1
            }
        ]
    })
    res.status(200).json({
        status : "success",
        session
    })
})

exports.createBookings = asyncErrorHandler(async(req,res,next)=>{
    await Booking.create({
        tour : req.body.tourId,
        user : req.user._id,
        price : req.body.price
    })
    res.status(201).json({
        status : "success"
    })
})

exports.bookingsByUser = asyncErrorHandler(async(req,res,next)=>{
    const bookings = await Booking.find({user : req.user._id})
    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({_id : {$in : tourIds}})
    res.status(200).json({
        status : "success",
        tours
    })
})