const { Router } = require('express');
const { computerController } = require('../controllers/computer.controller');
const { checkPermission } = require('../middlewares/permission.middleware')

const router = Router();

// Monitor routes
router.get('/amount', checkPermission('view', 'admin'), computerController.getNumberOfComputers);
router.get('/all', checkPermission('view', 'admin'), computerController.viewAllComputers);
router.post('/manage/:id', checkPermission('manage', 'computer'), computerController.addToRoom);

// Room management routes (for admin)
router.post('/:id/room/add', checkPermission('manage', 'admin'), computerController.addToRoom);
router.post('/:id/room/remove', checkPermission('manage', 'admin'), computerController.removeFromRoom);
router.post('/:id/room/change', checkPermission('manage', 'admin'), computerController.changeRoom);

// View Activities
router.get('/:id/processes', checkPermission('view', 'computer'), computerController.viewComputerProcesses);
router.get('/:id/network', checkPermission('view', 'computer'), computerController.viewComputerNetwork);

module.exports = router;
