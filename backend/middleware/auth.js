const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  console.log(`--- AUTH MIDDLEWARE ---`);
  console.log(`Checking request for route: ${req.method} ${req.originalUrl}`);
  
  // 1. Get token from the header
  const token = req.header('x-auth-token');
  if (!token) {
    console.error('AUTH FAIL: No token found in header.');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  console.log('AUTH INFO: Token found in header.');

  // 2. Check for the JWT_SECRET in the environment
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL SERVER ERROR: JWT_SECRET is not defined in .env file!');
    return res.status(500).json({ msg: 'Server configuration error.' });
  }
  console.log('AUTH INFO: JWT_SECRET is loaded.');

  // 3. Verify the token
  try {
    const decoded = jwt.verify(token, secret);
    
    // 4. Check if the decoded token has the user object
    if (!decoded.user) {
        console.error('AUTH FAIL: Token is valid, but does not contain user information.');
        return res.status(401).json({ msg: 'Token is missing user payload.' });
    }

    console.log('AUTH SUCCESS: Token verified. User ID:', decoded.user.id);
    req.user = decoded.user; // Attach user to the request object
    next(); // Proceed to the next step (the route handler)
  } catch (err) {
    console.error('AUTH FAIL: Token verification failed with error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};