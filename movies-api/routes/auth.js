const express = require('express');
const boom = require('@hapi/boom');
const passport = require('passport');
const ApiKeysService = require('../services/apiKeys');
const UsersService = require('../services/users');
const jwt = require('jsonwebtoken');
const { config } = require('../config/index');
const validationHandler = require('../utils/middleware/validationHandler');
const {
  createUserSchema,
  createProviderUserSchema,
} = require('../utils/schemas/users');
//Basic strategy
require('../utils/auth/strategies/basic');

function apiAuth(app) {
  const router = express.Router();
  app.use('/api/auth', router);

  const apiKeysService = new ApiKeysService();
  const usersService = new UsersService();

  router.post('/sign-in', async function (req, res, next) {
    const { apiKeyToken } = req.body;

    if (!apiKeyToken) {
      next(boom.unauthorized('Api Key Token is required'));
    }

    passport.authenticate('basic', function (error, user) {
      try {
        if (error || !user) {
          next(boom.unauthorized());
        }
        req.login(user, { session: false }, async function (error) {
          if (error) {
            next(boom.unauthorized());
          }

          const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

          if (!apiKey) {
            next(boom.unauthorized());
          }

          const { _id: id, name, email } = user;

          const payload = {
            sub: id,
            name,
            email,
            scopes: apiKey.scopes,
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m',
          });

          res.status(200).json({
            token,
            user: {
              id,
              name,
              email,
            },
          });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });

  router.post('/sign-up', validationHandler(createUserSchema), async function (
    req,
    res,
    next
  ) {
    const { body: user } = req;

    try {
      const createdIdUser = await usersService.createUser({ user });
      res.status(201).json({
        data: createdIdUser,
        message: 'user created',
      });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    '/sign-provider',
    validationHandler(createProviderUserSchema),
    async function (req, res, next) {
      const { body } = req;
      const { apiKeyToken, ...user } = body;
      if (!apiKeyToken) {
        next(boom.unauthorized('Missing Api Key Token'));
      }
      try {
        const queriedUser = await usersService.getOrCreateUser({ user });
        const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

        if (!apiKey) {
          next(boom.unauthorized());
        }

        const { _id: id, name, email } = queriedUser;

        const payload = {
          sub: id,
          name,
          email,
          scopes: apiKey.scopes,
        };

        const token = jwt.sign(payload, config.authJwtSecret, {
          expiresIn: '15min',
        });

        return res.status(200).json({
          token,
          user: {
            id,
            name,
            email,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );
}

module.exports = apiAuth;
