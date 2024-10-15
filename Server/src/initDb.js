const db = require('./db');
const bcrypt = require('bcrypt');

function initDatabase() {
  db.serialize(() => {
    // Create Users table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL
    )`);

    // Create Rooms table if not exists 
    db.run(`CREATE TABLE IF NOT EXISTS Rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )`);

    // Create Computers table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS Computers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostname TEXT,
      ip_address TEXT,
      mac_address TEXT UNIQUE NOT NULL,
      os TEXT,
      os_version TEXT,
      memory TEXT,
      processor TEXT,
      storage TEXT,
      last_updated DATETIME,
      room_id INTEGER,
      FOREIGN KEY (room_id) REFERENCES Rooms(id)
    )`);

    // Create UserRoomPermissions table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS UserRoomPermissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      can_view INTEGER DEFAULT 0,
      can_manage INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (room_id) REFERENCES Rooms(id),
      UNIQUE(user_id, room_id)
    )`);

    let defaultAdminPassword = 'adminpass';
    bcrypt.hash(defaultAdminPassword, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing default admin password:', err);
        return;
      }

      // Create default admin user if not exists  
      db.run(`INSERT INTO Users (username, password_hash, email, full_name, role) 
                        VALUES ('admin', '${hash}', 'admin@example.com', 'Admin', 'admin') 
                        ON CONFLICT(email) DO NOTHING`);
    });

    console.log('Database initialized successfully');
  });
}

initDatabase();

module.exports = initDatabase;

