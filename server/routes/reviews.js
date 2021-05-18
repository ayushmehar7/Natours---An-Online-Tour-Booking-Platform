const express = require("express")
const router = express.Router({mergeParams : true})
const reviewController = require("../controllers/reviews")
const userController = require("../controllers/user")

router.route("/")
.get(reviewController.getAllReviews)
.post(userController.protectedRoute,userController.restrictTo("user"),reviewController.addReview)
.patch(userController.protectedRoute,userController.restrictTo("user","admin"),reviewController.editReview)

router.route("/:id").delete(userController.protectedRoute,userController.restrictTo("user","admin"),reviewController.deleteReview)

router.route("/userReviews").get(userController.protectedRoute,reviewController.getReviewsFromUser)

module.exports = router