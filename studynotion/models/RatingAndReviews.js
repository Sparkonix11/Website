const mongoose = require('mongoose');

const ratingAndReviewsSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    rating: {
        type: Number,
        trim: true,
    },
    review: {
        type: String,
        required: true,
    },

});

module.exports = mongoose.model("RatingAndReviews", ratingAndReviewsSchema);