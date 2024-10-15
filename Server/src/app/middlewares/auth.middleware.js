const { verifyAccessToken } = require('../utils/jwt');

module.exports = async (req, res, next) => {
  let token = req.header('x-auth-token');

  if (!token) {
    token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  }

  try {
    const decoded = await verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

