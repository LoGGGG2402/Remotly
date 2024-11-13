const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const config = require('../../config');
const { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT tokens
            const accessToken = await signAccessToken({ id: user._id, role: user.role });
            const refreshToken = await signRefreshToken({ id: user._id, role: user.role });

            res.cookie('token', accessToken, { httpOnly: true, secure: true, maxAge: 900000 }); // 15 minutes
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 604800000 }); // 7 days
            let userData = { id: user._id, name: user.name, email: user.email, role: user.role };
            res.cookie('user', userData, { secure: true, maxAge: 900000 });

            res.json({ token: accessToken, refreshToken, userData });
        } catch (error) {
            console.log('Error logging in:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    refresh: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        try {
            const decoded = await verifyRefreshToken(refreshToken);
            const accessToken = await signAccessToken({ id: decoded.id, role: decoded.role });
            
            res.cookie('token', accessToken, { httpOnly: true, secure: true, maxAge: 900000 });
            res.json({ token: accessToken });
        } catch (error) {
            res.status(401).json({ message: 'Invalid refresh token' });
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    },

    createAccount: async (req, res) => {
        const { name, email, password, role } = req.body;

        // Check if the requester is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        try {
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create new user
            user = new User({ name, email, password, role });

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Save user
            await user.save();

            res.status(201).json({ message: 'User created successfully', user: { id: user._id, name, email, role } });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = { authController };

