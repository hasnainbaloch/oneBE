import passport from 'passport';
import '../modules/auth/strategies/google.strategy';
import User from '../modules/users/user.model';

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;