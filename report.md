# Final Enhancement Report: Vehicle Reviews System

## Enhancement Overview

For the final project enhancement, I implemented a **Vehicle Reviews** system that allows logged-in users to write, edit, and delete reviews for vehicles in the CSE Motors inventory. This feature enhances customer engagement by letting users share their opinions and ratings (1-5 stars) on individual vehicles. Other visitors (both logged-in and guest) can read reviews on any vehicle's detail page.

---

## 1. Database

**New Table:** `review`

A new `review` table was created in the database (`database/review-table.sql`) with the following schema:

| Column        | Type                        | Constraints                                      |
|---------------|-----------------------------|--------------------------------------------------|
| review_id     | SERIAL                      | PRIMARY KEY                                      |
| review_text   | TEXT                        | NOT NULL                                         |
| review_rating | INTEGER                     | NOT NULL, CHECK (1-5)                            |
| review_date   | TIMESTAMP WITH TIME ZONE    | DEFAULT CURRENT_TIMESTAMP                        |
| account_id    | INTEGER                     | NOT NULL, FK -> account(account_id) ON DELETE CASCADE |
| inv_id        | INTEGER                     | NOT NULL, FK -> inventory(inv_id) ON DELETE CASCADE   |

The table uses foreign keys referencing both the `account` and `inventory` tables with `ON DELETE CASCADE`, ensuring data integrity when accounts or vehicles are removed. The `CHECK` constraint on `review_rating` enforces that ratings are always between 1 and 5.

---

## 2. Model

**New File:** `models/review-model.js`

The review model provides six functions for complete CRUD database interaction using SQL prepared statements:

- **`addReview(review_text, review_rating, account_id, inv_id)`** - Inserts a new review with parameterized queries
- **`getReviewsByInventoryId(inv_id)`** - Retrieves all reviews for a vehicle with JOIN to get reviewer names, ordered by most recent
- **`getReviewsByAccountId(account_id)`** - Retrieves all reviews by a user with JOIN to get vehicle details
- **`getReviewById(review_id)`** - Retrieves a single review with vehicle details for editing
- **`updateReview(review_id, review_text, review_rating)`** - Updates an existing review
- **`deleteReview(review_id)`** - Removes a review from the database

All functions use parameterized SQL queries (`$1, $2, ...`) to prevent SQL injection and include try/catch error handling.

---

## 3. Controller

**New File:** `controllers/reviewController.js`

The review controller contains six handler functions:

- **`buildAddReview`** - Renders the add review form; verifies the vehicle exists
- **`addReview`** - Processes review submission; validates ownership via JWT session data
- **`buildEditReview`** - Renders the edit form; enforces that only the author can edit
- **`updateReview`** - Processes review updates; re-verifies ownership before updating
- **`buildDeleteReview`** - Renders delete confirmation; enforces author-only access
- **`deleteReview`** - Processes review deletion; re-verifies ownership before deleting

**Modifications to existing controllers:**
- `invController.js` - Updated `buildByInventoryId` to fetch and pass reviews to the detail view
- `accountController.js` - Updated `buildAccountManagement` to fetch and pass the user's reviews

---

## 4. Views

**New Views (3 files in `views/review/`):**

- **`add-review.ejs`** - Form with interactive star rating input, textarea with minimum length, hidden fields for vehicle ID. Includes client-side validation attributes (`required`, `minlength`).
- **`edit-review.ejs`** - Pre-populated edit form with the same star rating interface and validation
- **`delete-confirm.ejs`** - Confirmation page showing review details before permanent deletion

**Modified Views (2 files):**

- **`views/inventory/detail.ejs`** - Added a "Customer Reviews" section below vehicle details that displays all reviews with author name (last name initial only for privacy), star rating, date, and review text. Shows a "Write a Review" button for logged-in users or a login prompt for guests.
- **`views/account/management.ejs`** - Added a "My Reviews" section with a table listing all of the user's reviews showing vehicle name, star rating, date, and Edit/Delete action links.

**CSS Additions (`public/css/styles.css`):**
- Styled review cards, star rating display, interactive star rating input, review form, delete button, review preview, and reviews table for account management

---

## 5. Data Validation

**New File:** `utilities/review-validation.js`

### Server-Side Validation (express-validator):
- **`review_text`**: trimmed, escaped (XSS prevention), must not be empty, minimum 10 characters
- **`review_rating`**: trimmed, must not be empty, must be an integer between 1 and 5
- **`inv_id`**: trimmed, must not be empty, must be a valid positive integer
- **`review_id`** (for updates): trimmed, must not be empty, must be a valid positive integer

Separate validation rule sets for adding (`reviewRules`) and updating (`updateReviewRules`) reviews. Each has a corresponding error-checking middleware (`checkReviewData`, `checkUpdateReviewData`) that re-renders the form with error messages and preserves user input (sticky form behavior).

### Client-Side Validation (HTML attributes):
- `required` attribute on rating radio inputs and textarea
- `minlength="10"` on the textarea
- Star rating uses radio buttons ensuring exactly one value is selected

---

## 6. Error Handling

Error handling is implemented at every layer:

- **Model Layer**: Every database function wraps queries in try/catch blocks, logs errors to console, and returns `null` or empty arrays on failure
- **Controller Layer**: All controller functions check for null/falsy results from model calls and provide appropriate flash messages. The `handleErrors` utility wrapper catches any unhandled async errors and passes them to Express error middleware
- **Route Layer**: All routes use `utilities.handleErrors()` wrapper for async error handling
- **Authorization**: Edit and delete operations verify that the logged-in user is the review author before processing; unauthorized users are redirected with a flash message
- **Missing Data**: Controllers check for missing vehicles and reviews, redirecting with error messages instead of crashing

---

## Routes Summary

**New File:** `routes/reviewRoute.js` (Base path: `/review/`)

| Method | Route                  | Handler          | Protection | Validation                    |
|--------|------------------------|------------------|------------|-------------------------------|
| GET    | `/add/:inv_id`         | buildAddReview   | checkLogin | -                             |
| POST   | `/add`                 | addReview        | checkLogin | reviewRules, checkReviewData  |
| GET    | `/edit/:review_id`     | buildEditReview  | checkLogin | -                             |
| POST   | `/update`              | updateReview     | checkLogin | updateReviewRules, checkUpdateReviewData |
| GET    | `/delete/:review_id`   | buildDeleteReview| checkLogin | -                             |
| POST   | `/delete`              | deleteReview     | checkLogin | -                             |

---

## Files Created/Modified

### New Files:
1. `database/review-table.sql` - SQL table definition
2. `models/review-model.js` - Database model
3. `controllers/reviewController.js` - Business logic
4. `utilities/review-validation.js` - Validation rules
5. `routes/reviewRoute.js` - Route definitions
6. `views/review/add-review.ejs` - Add review form
7. `views/review/edit-review.ejs` - Edit review form
8. `views/review/delete-confirm.ejs` - Delete confirmation
9. `report.md` - This report

### Modified Files:
1. `server.js` - Registered review routes
2. `controllers/invController.js` - Added review data to detail view
3. `controllers/accountController.js` - Added user reviews to account management
4. `views/inventory/detail.ejs` - Added reviews display section
5. `views/account/management.ejs` - Added user reviews table
6. `public/css/styles.css` - Added review-related styles
