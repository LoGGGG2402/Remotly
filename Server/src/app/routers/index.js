const { Router } = require('express');

const authMiddleware = require('../middlewares/auth.middleware')

const computerRouter = require('./computer.router');
const roomRouter = require('./room.router');
const authRouter = require('./auth.router');
const agentRouter = require('./agent.router');
const userRouter = require('./user.router'); // Add this line

const router = Router();

router.use('/computer', authMiddleware, computerRouter);
router.use('/auth', authRouter);
router.use('/room', authMiddleware, roomRouter);
router.use('/agent', agentRouter);
router.use('/user', authMiddleware, userRouter); // Add this line

module.exports = router;
