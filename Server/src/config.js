const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  logLevel: process.env.LOG_LEVEL || 'dev',
  databasePath: process.env.DATABASE_PATH || './database.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256'
  
};

module.exports = config;
