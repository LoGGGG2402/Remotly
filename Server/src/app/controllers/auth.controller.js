const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const config = require('../../config');
const { signAccessToken, verifyAccessToken } = require('../utils/jwt');


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
    
          // Generate JWT token
          const token = await signAccessToken({ id: user._id, role: user.role });
          res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
          let userData = { id: user._id, name: user.name, email: user.email, role: user.role };
          res.cookie('user', userData, { secure: true, maxAge: 3600000 });
    
          res.json({ token, userData });
        } catch (error) {
          console.log('Error logging in:', error);
          res.status(500).json({ message: 'Server error' });
        }
    },

    logout: async (req, res) => {
        res.clearCookie('token');
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

