const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// The manager's Google email address — set via MANAGER_EMAIL env var
const MANAGER_EMAIL = (process.env.MANAGER_EMAIL || '').toLowerCase().trim();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('\n  ⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login will not work.\n');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:3001/auth/google/callback',
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = (profile.emails?.[0]?.value || '').toLowerCase();
        const user = {
          id: profile.id,
          name: profile.displayName,
          email,
          avatar: profile.photos?.[0]?.value || '',
          // Anyone whose email matches MANAGER_EMAIL gets the manager role
          role: MANAGER_EMAIL && email === MANAGER_EMAIL ? 'manager' : 'user',
        };
        return done(null, user);
      }
    )
  );
}

module.exports = passport;
