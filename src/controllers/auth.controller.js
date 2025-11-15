const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { oauth2Client, scopes } = require('../config/google');
require('dotenv').config();

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and select the hidden token field
    const user = await User.findOne({ email }).select('+integrations.googleRefreshToken');
    
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    // 2. Create the userView with the correct path
    const userView = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      isGoogleLinked: !!user.integrations?.googleRefreshToken 
    };

    // 3. Send the userView
    res.status(200).json({ message: 'Login successful', token, user: userView });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 1. Get Google Auth URL
 */
exports.getGoogleAuthUrl = (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'User not authenticated. Cannot link Google account.' 
      });
    }

    const stateToken = jwt.sign(
      { id: req.user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', 
      scope: scopes,
      prompt: 'consent',
      state: stateToken
    });
    
    res.status(200).json({ url: authorizeUrl });

  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 2. Handle Google Auth Callback
 */
exports.googleCallback = async (req, res) => {
  const { code, state } = req.query;
  let userId;

  try {
    const decodedState = jwt.verify(state, process.env.JWT_SECRET);
    userId = decodedState.id;

    if (!userId) {
      throw new Error('Invalid state: User ID not found.');
    }

    const { tokens } = await oauth2Client.getToken(code);
    const { refresh_token } = tokens; 

    if (!refresh_token) {
      console.warn(`User ${userId} already authorized. No new refresh token provided.`);
      return res.redirect('http://localhost:3001/settings/profile');
    }

    // --- THIS IS THE FIX ---
    // Save the token to the correct nested path
    await User.findByIdAndUpdate(userId, {
      'integrations.googleRefreshToken': refresh_token,
    });
    // --- END OF FIX ---

    res.redirect('http://localhost:3001/settings/profile');

  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).redirect('http://localhost:3001/login?error=auth_expired');
    }
    res.status(500).redirect('http://localhost:3001/login?error=google_auth_failed');
  }
};