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
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewsSchema);