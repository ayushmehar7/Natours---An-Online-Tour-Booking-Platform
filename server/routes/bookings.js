const express = require("express")
const bookingsController = require("../controllers/bookings")
const userController = require("../controllers/user")
const router = express.Router()


router.get("/checkout-session/:tourId",userController.protectedRoute,bookingsController.getCheckoutSession)

router.post("/createBooking",userController.protectedRoute,bookingsController.createBookings)

router.get("/bookingsByUser",userController.protectedRoute,bookingsController.bookingsByUser);

module.exports = router