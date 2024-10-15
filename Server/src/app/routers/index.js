const { Router } = require('express');

const authMiddleware = require('../middlewares/auth.middleware')

const computerRouter = require('./computer.router');
const roomRouter = require('./room.router');
const authRouter = require('./auth.router');
const agentRouter = require('./agent.router');

const router = Router();

router.use('/computer', authMiddleware, computerRouter);
router.use('/auth', authRouter);
router.use('/room', authMiddleware, roomRouter);
router.use('/agent', agentRouter); 

module.exports = router;
