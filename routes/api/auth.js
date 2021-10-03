const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/Users');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => { // just by putting auth middleware in the second param, this route gets protected 
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/',
[
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
],
async (req, res) => {
    // Check validation of request
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user account exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({errors: [{ msg: 'Invalid credentials'}] });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({errors: [{ msg: 'Invalid credentials'}] });
        }

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 }, // optional but recommended
            (err, token) => {
                if(err) throw err;
                res.status(200).json({ token });
            }
        );
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;