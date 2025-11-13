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

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- ADD THE TWO NEW GOOGLE FUNCTIONS ---

/**
 * 1. Redirect user to Google's consent screen
 * This route MUST be protected by your auth middleware
 */
exports.getGoogleAuthUrl = (req, res) => {
  try {
    // 'req.user.id' must be available from your auth.middleware.js
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'User not authenticated. Cannot link Google account.' 
      });
    }

    // We create a short-lived JWT holding the user's ID.
    // This token will be passed as the 'state' parameter.
    const stateToken = jwt.sign(
      { id: req.user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // Generate the Google auth URL
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // 'offline' is required to get a refresh_token
      scope: scopes,
      prompt: 'consent',      // Forces user to re-consent (gets a new refresh_token)
      state: stateToken       // Pass our new 'state' token
    });
    
    // Send the user to Google
    res.status(200).json({ url: authorizeUrl });

  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 2. Handle the callback from Google
 * This is the route you set as your 'Redirect URI'
 */
exports.googleCallback = async (req, res) => {
  // Google sends back a 'code' and the 'state' we originally sent
  const { code, state } = req.query;

  let userId;

  try {
    // --- Verify the 'state' token ---
    // This confirms the request is legitimate and tells us WHICH user this is
    const decodedState = jwt.verify(state, process.env.JWT_SECRET);
    userId = decodedState.id;

    if (!userId) {
      throw new Error('Invalid state: User ID not found.');
    }

    // --- Exchange the 'code' for Google tokens ---
    const { tokens } = await oauth2Client.getToken(code);
    const { refresh_token } = tokens; // We only need to save the refresh_token

    if (!refresh_token) {
      console.warn(`User ${userId} already authorized. No new refresh token provided.`);
      // Just redirect them back, they are already linked.
      return res.redirect('http://localhost:3001/dashboard?google_linked=true');
    }

    // --- Save the token to your database ---
    // Make sure 'googleRefreshToken' is in your user.model.js
    await User.findByIdAndUpdate(userId, {
      googleRefreshToken: refresh_token,
    });

    // --- Success! Redirect back to your frontend ---
    res.redirect('http://localhost:3001/dashboard?google_linked=true');

  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    // If the 'state' token is bad (expired, invalid)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).redirect('http://localhost:3001/login?error=auth_expired');
    }
    // General error
    res.status(500).redirect('http://localhost:3001/login?error=google_auth_failed');
  }
};
