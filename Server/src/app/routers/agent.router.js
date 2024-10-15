const { Router } = require('express');
const { agentController } = require('../controllers/agent.controller');

const router = Router();

// Agent routes
router.post('/connect', agentController.connect);
router.post('/update-info/:mac_address', agentController.updateInfo);

module.exports = router;