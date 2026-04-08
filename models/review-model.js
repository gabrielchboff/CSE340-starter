const pool = require("../database/")

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(review_text, review_rating, account_id, inv_id) {
  try {
    const sql =
      "INSERT INTO review (review_text, review_rating, account_id, inv_id) VALUES ($1, $2, $3, $4) RETURNING *"
    const result = await pool.query(sql, [review_text, review_rating, account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("addReview error " + error)
    return null
  }
}

/* ***************************
 *  Get all reviews for a specific vehicle
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname
      FROM public.review AS r
      JOIN public.account AS a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error " + error)
    return []
  }
}

/* ***************************
 *  Get all reviews by a specific account
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year
      FROM public.review AS r
      JOIN public.inventory AS i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByAccountId error " + error)
    return []
  }
}

/* ***************************
 *  Get a single review by review_id
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year
      FROM public.review AS r
      JOIN public.inventory AS i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error " + error)
    return null
  }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_text, review_rating) {
  try {
    const sql =
      "UPDATE public.review SET review_text = $1, review_rating = $2 WHERE review_id = $3 RETURNING *"
    const result = await pool.query(sql, [review_text, review_rating, review_id])
    return result.rows[0]
  } catch (error) {
    console.error("updateReview error " + error)
    return null
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = "DELETE FROM public.review WHERE review_id = $1"
    const result = await pool.query(sql, [review_id])
    return result
  } catch (error) {
    console.error("deleteReview error " + error)
    return null
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  getReviewById,
  updateReview,
  deleteReview,
}
