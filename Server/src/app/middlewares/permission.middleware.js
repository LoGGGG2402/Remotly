const UserRoomPermissionModel = require('../models/Permission.model');
const ComputerModel = require('../models/Computer.model'); // Add this line

const checkPermission = (action, scope = 'room') => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.id;
  let roomId;

  try {
    // if user is admin, they can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    if (scope === 'admin') {
      return res.status(403).json({ error: 'You do not have permission to view all computers' });
    }

    if (scope === 'computer') {
      const computerId = req.params.id || req.body.computerId;
      const computer = await ComputerModel.findById(computerId);
      if (!computer) {
        return res.status(404).json({ error: 'Computer not found' });
      }
      roomId = computer.room_id;
    } else {
      roomId = req.params.id || req.body.id;
    }
    console.log('roomId:', roomId);
    const permission = await UserRoomPermissionModel.findByUserAndRoom(userId, roomId);
    console.log('permission:', permission);
    if (!permission) {
      return res.status(403).json({ error: 'You do not have permission for this room' });
    }

    if (action === 'view' && !permission.can_view) {
      return res.status(403).json({ error: 'You do not have permission to view computers in this room' });
    }

    if (action === 'manage' && !permission.can_manage) {
      return res.status(403).json({ error: 'You do not have permission to manage computers in this room' });
    }

    next();
  } catch (error) {
    console.error('Error checking permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { checkPermission };
