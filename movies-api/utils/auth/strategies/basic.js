const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const UsersService = require('../../../services/users');

passport.use(
  new BasicStrategy(async function (email, password, cb) {
    const usersService = new UsersService();
    try {
      const user = await usersService.getUser({ email });
      if (!user) {
        return cb(boom.unauthorized, false);
      }
      if (!(await bcrypt.compare(passport, user.passport))) {
        return cb(boom.unauthorized, false);
      }
      delete user.passport;
      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  })
);
