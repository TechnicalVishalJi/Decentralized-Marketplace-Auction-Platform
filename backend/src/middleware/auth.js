const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// MIDDLEWARE 1: protect
// Verifies JWT token. Blocks request if invalid/missing.
// Usage: router.put('/:address', protect, controller.updateUser)
// ============================================================
const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token (throws error if expired or invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user from database
    const user = await User.findById(decoded.id).select('-nonce');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token is valid but user no longer exists.'
      });
    }

    // 4. Attach user to request object
    req.user = user;

    // 5. Pass to next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }
};

// ============================================================
// MIDDLEWARE 2: authorize
// Checks if logged-in user is the owner of the resource.
// Prevents user A from editing user B's profile.
// Usage: router.put('/:address', protect, authorize, controller.updateUser)
// ============================================================
const authorize = (req, res, next) => {
  // req.params.address = address in the URL
  // req.user.walletAddress = address from JWT token

  const urlAddress = req.params.address?.toLowerCase();
  const tokenAddress = req.user?.walletAddress?.toLowerCase();

  if (!urlAddress || !tokenAddress) {
    return res.status(400).json({
      success: false,
      error: 'Address missing from request.'
    });
  }

  if (urlAddress !== tokenAddress) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. You can only modify your own profile.'
    });
  }

  next();
};

// ============================================================
// MIDDLEWARE 3: adminOnly
// Checks if logged-in user has admin role.
// Usage: router.get('/admin/fees', protect, adminOnly, controller.getFees)
// ============================================================
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Admin access required.'
    });
  }

  next();
};

// ============================================================
// MIDDLEWARE 4: optionalAuth
// Attaches user to req IF token is present, but doesn't block.
// Useful for endpoints that work for both guests and logged-in users.
// Example: GET /nfts - guests can browse, logged-in users see if they liked it
// ============================================================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-nonce');
      req.user = user; // Attach if found
    }
    // No token? Just continue without req.user
    next();
  } catch (error) {
    // Invalid token? Still continue (don't block)
    next();
  }
};

module.exports = { protect, authorize, adminOnly, optionalAuth };