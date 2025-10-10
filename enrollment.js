const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// ROUTE 1: Student requests enrollment
router.post('/request', auth, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ msg: 'You have already requested enrollment for this course.' });
        }

        const newEnrollment = new Enrollment({ user: userId, course: courseId });
        await newEnrollment.save();
        res.status(201).json({ msg: 'Enrollment request submitted successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ROUTE 2: Admin gets all pending enrollments
router.get('/pending', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ status: 'pending' })
            .populate('user', ['name', 'email'])
            .populate('course', ['title']);
        res.json(enrollments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ROUTE 3: Admin confirms an enrollment (THIS IS THE MISSING PART)
router.put('/confirm/:id', auth, async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        );
        if (!enrollment) return res.status(404).json({ msg: 'Enrollment not found' });
        res.json(enrollment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ROUTE 4: Student gets their active courses
router.get('/mycourses', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ 
            user: req.user.id, 
            status: 'active' 
        }).populate('course');

        res.json(enrollments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;