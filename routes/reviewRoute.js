// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validation")

// Route to build add review view (must be logged in)
router.get("/add/:inv_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildAddReview))

// Route to process add review
router.post(
  "/add",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to build edit review view (must be logged in)
router.get("/edit/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildEditReview))

// Route to process update review
router.post(
  "/update",
  utilities.checkLogin,
  reviewValidate.updateReviewRules(),
  reviewValidate.checkUpdateReviewData,
  utilities.handleErrors(reviewController.updateReview)
)

// Route to build delete review confirmation view (must be logged in)
router.get("/delete/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildDeleteReview))

// Route to process delete review
router.post("/delete", utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview))

module.exports = router
