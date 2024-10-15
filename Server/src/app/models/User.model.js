const db = require('../../db');

const UserModel = {
  create: (user) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [user.username, user.password_hash, user.email, user.full_name, user.role], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Users WHERE username = ?';
      db.get(sql, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Users WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Users';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  update: (user) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE Users SET username = ?, password_hash = ?, email = ?, full_name = ?, is_admin = ? WHERE id = ?';
      db.run(sql, [user.username, user.password_hash, user.email, user.full_name, user.is_admin ? 1 : 0, user.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Users WHERE id = ?';
      db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

module.exports = UserModel;
