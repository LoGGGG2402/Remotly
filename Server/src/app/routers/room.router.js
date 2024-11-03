const { Router } = require('express');
const { roomController } = require('../controllers/room.controller');
const { checkPermission } = require('../middlewares/permission.middleware')

const router = Router();

router.get('/amount', roomController.getNumberOfRooms);
router.get('/all', checkPermission('view', 'admin'), roomController.viewAllRooms);
router.get('/:id', checkPermission('view'), roomController.viewComputersInRoom);
router.post('/manage/:id', checkPermission('manage'), roomController.manageComputersInRoom);

// Admin routes
router.post('/:id/addUser', checkPermission('manage', 'admin'), roomController.addUserToRoom);
router.post('/:id/removeUser', checkPermission('manage', 'admin'), roomController.removeUserFromRoom);
router.post('/:id/addComputers', checkPermission('manage', 'admin'), roomController.addMultipleComputersToRoom);
router.post('/', checkPermission('manage', 'admin'), roomController.createRoom);

module.exports = router;


