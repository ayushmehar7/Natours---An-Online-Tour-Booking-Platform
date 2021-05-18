const express = require("express")
const router = express.Router();
const userController = require("../controllers/user")
const {getAllTours,createTour,getTourById,editTour,deleteTour,getToursWithin,getDistances} = require("../controllers/tours")
const reviewRouter = require("../routes/reviews")

router.use("/:tourId/reviews",reviewRouter)

router.route("/")
.get(getAllTours)
.post(userController.protectedRoute,userController.restrictTo("admin","lead-guide"),createTour)

router.route("/tours-within/:distance/center/:latlng/unit/:unit")
.get(getToursWithin)

router.route('/distances/:latlng/unit/:unit')
.get(getDistances);

router.route("/:id")
.get(getTourById)
.patch(userController.protectedRoute,userController.restrictTo("admin","lead-guide"),editTour)
.delete(userController.protectedRoute,userController.restrictTo("admin"),deleteTour)

module.exports = router