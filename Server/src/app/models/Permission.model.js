const db = require('../../db');

const UserRoomPermissionModel = {
  create: (permission) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO UserRoomPermissions (user_id, room_id, can_view, can_manage) VALUES (?, ?, ?, ?)';
      db.run(sql, [permission.user_id, permission.room_id, permission.can_view ? 1 : 0, permission.can_manage ? 1 : 0], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM UserRoomPermissions WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByUserAndRoom: (userId, roomId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM UserRoomPermissions WHERE user_id = ? AND room_id = ?';
      db.get(sql, [userId, roomId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByUser: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM UserRoomPermissions WHERE user_id = ?';
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM UserRoomPermissions';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  update: (permission) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE UserRoomPermissions SET user_id = ?, room_id = ?, can_view = ?, can_manage = ? WHERE id = ?';
      db.run(sql, [permission.user_id, permission.room_id, permission.can_view ? 1 : 0, permission.can_manage ? 1 : 0, permission.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM UserRoomPermissions WHERE id = ?';
      db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  deleteByUserAndRoom: (userId, roomId) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM UserRoomPermissions WHERE user_id = ? AND room_id = ?';
      db.run(sql, [userId, roomId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  findByRoom : (roomId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM UserRoomPermissions WHERE room_id = ?';
      db.all(sql, [roomId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = UserRoomPermissionModel;