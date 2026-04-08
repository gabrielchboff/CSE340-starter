const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ***************************
 *  Build add review view
 * ************************** */
reviewCont.buildAddReview = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const vehicleData = await invModel.getInventoryById(inv_id)
  if (!vehicleData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/")
  }
  let nav = await utilities.getNav()
  const vehicleName = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
  res.render("review/add-review", {
    title: "Review " + vehicleName,
    nav,
    errors: null,
    inv_id,
    vehicleName,
  })
}

/* ***************************
 *  Process add review
 * ************************** */
reviewCont.addReview = async function (req, res) {
  let nav = await utilities.getNav()
  const { review_text, review_rating, inv_id } = req.body
  const account_id = res.locals.accountData.account_id

  const addResult = await reviewModel.addReview(
    review_text,
    parseInt(review_rating),
    account_id,
    parseInt(inv_id)
  )

  if (addResult) {
    req.flash("notice", "Your review was successfully added.")
    res.redirect(`/inv/detail/${inv_id}`)
  } else {
    const vehicleData = await invModel.getInventoryById(inv_id)
    const vehicleName = vehicleData
      ? `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
      : "Vehicle"
    req.flash("notice", "Sorry, the review could not be added.")
    res.status(501).render("review/add-review", {
      title: "Review " + vehicleName,
      nav,
      errors: null,
      inv_id,
      vehicleName,
      review_text,
      review_rating,
    })
  }
}

/* ***************************
 *  Build edit review view
 * ************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const reviewData = await reviewModel.getReviewById(review_id)
  if (!reviewData) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/")
  }
  // Only the review author can edit
  if (reviewData.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to edit this review.")
    return res.redirect("/account/")
  }
  let nav = await utilities.getNav()
  const vehicleName = `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`
  res.render("review/edit-review", {
    title: "Edit Review - " + vehicleName,
    nav,
    errors: null,
    review_id: reviewData.review_id,
    review_text: reviewData.review_text,
    review_rating: reviewData.review_rating,
    vehicleName,
  })
}

/* ***************************
 *  Process edit review
 * ************************** */
reviewCont.updateReview = async function (req, res) {
  let nav = await utilities.getNav()
  const { review_id, review_text, review_rating } = req.body

  // Verify ownership
  const existingReview = await reviewModel.getReviewById(parseInt(review_id))
  if (!existingReview || existingReview.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to edit this review.")
    return res.redirect("/account/")
  }

  const updateResult = await reviewModel.updateReview(
    parseInt(review_id),
    review_text,
    parseInt(review_rating)
  )

  if (updateResult) {
    req.flash("notice", "Your review was successfully updated.")
    res.redirect("/account/")
  } else {
    const vehicleName = existingReview
      ? `${existingReview.inv_year} ${existingReview.inv_make} ${existingReview.inv_model}`
      : "Vehicle"
    req.flash("notice", "Sorry, the review update failed.")
    res.status(501).render("review/edit-review", {
      title: "Edit Review - " + vehicleName,
      nav,
      errors: null,
      review_id,
      review_text,
      review_rating,
      vehicleName,
    })
  }
}

/* ***************************
 *  Build delete review confirmation view
 * ************************** */
reviewCont.buildDeleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const reviewData = await reviewModel.getReviewById(review_id)
  if (!reviewData) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/")
  }
  // Only the review author can delete
  if (reviewData.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to delete this review.")
    return res.redirect("/account/")
  }
  let nav = await utilities.getNav()
  const vehicleName = `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`
  res.render("review/delete-confirm", {
    title: "Delete Review - " + vehicleName,
    nav,
    errors: null,
    review_id: reviewData.review_id,
    review_text: reviewData.review_text,
    review_rating: reviewData.review_rating,
    vehicleName,
  })
}

/* ***************************
 *  Process delete review
 * ************************** */
reviewCont.deleteReview = async function (req, res) {
  const review_id = parseInt(req.body.review_id)

  // Verify ownership
  const existingReview = await reviewModel.getReviewById(review_id)
  if (!existingReview || existingReview.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to delete this review.")
    return res.redirect("/account/")
  }

  const deleteResult = await reviewModel.deleteReview(review_id)

  if (deleteResult) {
    req.flash("notice", "Your review was successfully deleted.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the review deletion failed.")
    res.redirect(`/review/delete/${review_id}`)
  }
}

module.exports = reviewCont
