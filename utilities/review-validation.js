const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Review text must be at least 10 characters long."),

    body("review_rating")
      .trim()
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("inv_id")
      .trim()
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("A valid vehicle is required."),
  ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_text, review_rating, inv_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("review/add-review", {
      errors,
      title: "Add Review",
      nav,
      review_text,
      review_rating,
      inv_id,
      vehicleName: req.body.vehicleName || "Vehicle",
    })
    return
  }
  next()
}

/*  **********************************
 *  Review Update Validation Rules
 * ********************************* */
validate.updateReviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Review text must be at least 10 characters long."),

    body("review_rating")
      .trim()
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("review_id")
      .trim()
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("A valid review ID is required."),
  ]
}

/* ******************************
 * Check review update data and return errors or continue
 * ***************************** */
validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_id, review_text, review_rating } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("review/edit-review", {
      errors,
      title: "Edit Review",
      nav,
      review_id,
      review_text,
      review_rating,
      vehicleName: req.body.vehicleName || "Vehicle",
    })
    return
  }
  next()
}

module.exports = validate
