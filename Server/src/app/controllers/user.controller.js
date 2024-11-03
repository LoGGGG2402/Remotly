const { create } = require('../models/Room.model');
const UserModel = require('../models/User.model');
const bcrypt = require('bcrypt');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const users = await UserModel.findAll();
            res.status(200).json({ users });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    createUser: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { username, password, email, fullname, role } = req.body;
            let password_hash = await bcrypt.hash(password, 10);

            let newUser = {
                username,
                password_hash,
                email,
                fullname,
                role,
            };
            const user = await UserModel.create(newUser);
            res.status(201).json({ user });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = { userController };
