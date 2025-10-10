// backend/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    teacher: { type: String, default: 'Vedang Soni' },
    content: [{
        title: String,
        type: {
            type: String,
            enum: ['video', 'pdf', 'link']
        },
        url: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('course', CourseSchema);