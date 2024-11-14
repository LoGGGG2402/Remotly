const { Router } = require('express');
const { roomController } = require('../controllers/room.controller');
const { checkPermission } = require('../middlewares/permission.middleware')

const router = Router();

router.get('/amount', roomController.getNumberOfRooms);
router.get('/all', roomController.viewAllRooms);
router.get('/:id', checkPermission('view'), roomController.viewComputersInRoom);
router.post('/:id/manage', checkPermission('manage'), roomController.manageComputersInRoom);

// Admin routes
router.post('/', checkPermission('manage', 'admin'), roomController.createRoom);
router.post('/:id/addUser', checkPermission('manage', 'admin'), roomController.addUserToRoom);
router.post('/:id/removeUser', checkPermission('manage', 'admin'), roomController.removeUserFromRoom);
router.post('/:id/addComputers', checkPermission('manage', 'admin'), roomController.addMultipleComputersToRoom);
router.delete('/:id', checkPermission('manage', 'admin'), roomController.deleteRoom);
router.post('/:id/removeUser', checkPermission('manage', 'admin'), roomController.removeUserFromRoom);
router.get('/:id/users', checkPermission('view', 'admin'), roomController.viewUsersInRoom);

module.exports = router;


