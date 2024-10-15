const db = require('../../db');

const RoomModel = {
  create: (room) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Rooms (name, description) VALUES (?, ?)';
      db.run(sql, [room.name, room.description], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Rooms WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Rooms';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  update: (room) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE Rooms SET name = ?, description = ? WHERE id = ?';
      db.run(sql, [room.name, room.description, room.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Rooms WHERE id = ?';
      db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

module.exports = RoomModel;
