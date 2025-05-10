import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { prisma } from '@prodgenie/libs/prisma';

const SECRET_KEY = process.env.JWT_SECRET_PASSPORT || 'your-secret-key';

// Local Strategy (For Login)
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy (For Protected Routes)

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_PASSPORT || 'your-secret-key',
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
          include: {
            org: true,
          },
        });
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Middleware for route protection
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Optional: Role-based middleware (ADMIN, OWNER)
export const requireAdmin = (req, res, next) => {
  if (req.user?.type === 'ADMIN' || req.user?.type === 'OWNER') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admins only' });
};

export const requireOwner = (req, res, next) => {
  if (req.user?.type === 'OWNER') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Owners only' });
};

export default passport;
