const mongoose = require('mongoose');

const tagsSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    course: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],  
    

});

module.exports = mongoose.model("Tag", tagsSchema);