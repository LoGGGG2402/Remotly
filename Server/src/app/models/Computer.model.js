const db = require('../../db');

const ComputerModel = {
  create: (computer) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Computers (hostname, ip_address, mac_address, os, os_version, memory, processor, storage, room_id, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.run(sql, [computer.hostname, computer.ip_address, computer.mac_address, computer.os, computer.os_version, computer.memory, computer.processor, computer.storage, computer.room_id, computer.last_updated], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Computers WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Computers';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  update: (computer) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE Computers SET hostname = ?, ip_address = ?, mac_address = ?, os = ?, os_version = ?, memory = ?, processor = ?, storage = ?, room_id = ?, last_updated = ? WHERE id = ?';
      db.run(sql, [computer.hostname, computer.ip_address, computer.mac_address, computer.os, computer.os_version, computer.memory, computer.processor, computer.storage, computer.room_id, computer.last_updated, computer.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Computers WHERE id = ?';
      db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  findByMacAddress: (macAddress) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Computers WHERE mac_address = ?';
      db.get(sql, [macAddress], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByRoomId: (roomId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Computers WHERE room_id = ?';
      db.all(sql, [roomId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
};

module.exports = { ComputerModel };
