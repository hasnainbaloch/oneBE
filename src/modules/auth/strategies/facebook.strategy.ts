import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../../users/user.model';

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FB_CLIENT_ID!,
            clientSecret: process.env.FB_CLIENT_SECRET!,
            callbackURL: '/api/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({ facebookId: profile.id });

                if (existingUser) {
                    return done(null, existingUser);
                }

                // ⚠️ Don't auto-create — ask frontend for consent
                return done(null, false, {
                    message: 'User not found',
                    profile,
                });
            } catch (err) {
                return done(err);
            }
        }
    )
);