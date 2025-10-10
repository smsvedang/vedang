const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @route   POST api/courses
// @desc    Create a new course
router.post('/', auth, async (req, res) => {
    const { title, description, price } = req.body;
    try {
        const newCourse = new Course({ title, description, price });
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses
// @desc    Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/:id
// @desc    Delete a course AND its enrollments
router.delete('/:id', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        let course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        await Enrollment.deleteMany({ course: courseId });
        await Course.findByIdAndDelete(courseId);

        res.json({ msg: 'Course and all associated enrollments have been removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses/:id
// @desc    Get a single course content, only for enrolled students
router.get('/:id', auth, async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: req.params.id,
            status: 'active'
        });
        if (!enrollment) {
            return res.status(403).json({ msg: 'Access denied. You are not enrolled in this course.' });
        }
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found.' });
        }
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses/admin/:id
// @desc    Get a single course for the admin panel
router.get('/admin/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found.' });
        }
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/courses/:id
// @desc    Update course content
router.put('/:id', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: { content: content } },
            { new: true }
        );
        if (!updatedCourse) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json(updatedCourse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;