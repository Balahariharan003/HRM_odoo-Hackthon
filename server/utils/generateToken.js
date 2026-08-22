const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'dayflow_hrms_secret_key';
  
  return jwt.sign(
    {
      userId: payload.id || payload.userId,
      email: payload.email,
      role: payload.role,
    },
    secret,
    { expiresIn: '24h' }
  );
};

module.exports = generateToken;
