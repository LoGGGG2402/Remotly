const { Router } = require('express');
const { userController } = require('../controllers/user.controller');
const { checkPermission } = require('../middlewares/permission.middleware')

const router = Router();

router.get('/all', checkPermission('view', 'admin'), userController.getAllUsers);
router.post('/create', checkPermission('manage', 'admin'), userController.createUser);
router.delete('/:id', checkPermission('manage', 'admin'), userController.deleteUser);
router.get('/amount', userController.getNumberOfUsers);

module.exports = router;