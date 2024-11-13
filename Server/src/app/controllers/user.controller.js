const { create } = require('../models/Room.model');
const UserModel = require('../models/User.model');
const PermissionModel = require('../models/Permission.model');
const bcrypt = require('bcrypt');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const users = await UserModel.findAll();
            // only return username, email, fullname, role, id
            users.forEach((user) => {
                delete user.password_hash;
            });
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
    deleteUser: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { id } = req.params;
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // check if user have any permissions
            const permissions = await PermissionModel.findByUser(id);
            if (permissions.length > 0) {
                for (let permission of permissions) {
                    await PermissionModel.delete(permission.id);
                }
            }
            await UserModel.delete(id);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getNumberOfUsers: async (req, res) => {
        try {
            const users = await UserModel.findAll();
            res.status(200).json({ numberOfUsers: users.length });
        } catch (error) {
            console.error('Error getting number of users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = { userController };
