// const express = require('express');
// const passport = require('passport');
// const boom = require('@hapi/boom');
// const jwt = require('jsonwebtoken');
// const ApiKeysService = require('../services/apiKeys');
// const { config } = require('../config/index');
// //Basic strategy
// require('../utils/auth/strategies/basic');

// function authApi(app) {
//   const router = express.Router();
//   app.use('/api/auth', router);

//   const apiKeysService = new ApiKeysService();

//   router.post('/sign-in', async function (req, res, next) {
//     const { apiKeyToken } = req.body;
//     if (!apiKeyToken) {
//       next(boom.unauthorized('apiKeyToken is required'));
//     }

//     passport.authenticate('basic', function (error, user) {
//       try {
//         if (error || !user) {
//           next(boom.unauthorized());
//         }
//         req.login(user, { session: false }, async function (error) {
//           if (error) {
//             next(error);
//           }
//           const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });
//           if (!apiKey) {
//             next(boom.unauthorized());
//           }
//           const { _id: id, name, email } = user;
//           const payload = {
//             sub: id,
//             name,
//             email,
//             scopes: apiKeyToken.scopes,
//           };
//           const token = jwt.sign(payload, config.authJwtSecret, {
//             expiresIn: '15m',
//           });

//           return res.status(200).json({ token, user: { id, name, email } });
//         });
//       } catch (error) {
//         next(error);
//       }
//     })(req, res, next);
//   });
// }

// module.exports = authApi;

const express = require('express');
const ApiKeysService = require('../services/apiKeys');
const boom = require('@hapi/boom');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/');
//requiriendo la basic strategy
require('../utils/auth/strategies/basic');

function authApi(app) {
  const router = express.Router();
  app.use('/api/auth/', router);

  router.post('/sign-in', async function (req, res, next) {
    const [apiKeyToken] = req.body;
    if (!apiKeyToken) {
      next(boom.unauthorized('Missing Api Key Token'));
    }
    passport.authenticate('basic', async function (error, user) {
      try {
        if (error || !user) {
          next(boom.unauthorized());
        }

        passport.login(user, { session: false }, async function (error) {
          if (error) {
            next(error);
          }
          const apiKeyService = new ApiKeysService();
          const apiKey = await apiKeyService.getApiKey({ token: apiKeyToken });
          if (!apiKey) {
            next(boom.unauthorized());
          }
          const { _id: id, email, name } = user;

          const payload = {
            sub: id,
            email,
            name,
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
        })(req, res, next);
      } catch (error) {
        next(error);
      }
    });
  });
}

module.exports = authApi;
