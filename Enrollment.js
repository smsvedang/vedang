const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('enrollment', EnrollmentSchema);