const express = require('express');
const passport = require('passport');

const UserMoviesService = require('../services/userMovies');
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidation = require('../utils/middleware/scopesValidation');

const { userIdSchema } = require('../utils/schemas/users');
//const { movieIdSchema } = require('../utils/schemas/movies');
const {
  createUserMovieSchema,
  userMovieIdSchema,
} = require('../utils/schemas/userMovies');

require('../utils/auth/strategies/jwt');

function userMoviesApi(app) {
  const router = express.Router();
  app.use('/api/user-movies', router);
  const userMoviesService = new UserMoviesService();

  router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    scopesValidation(['read:user-movies']),
    validationHandler({ userId: userIdSchema }, 'query'),
    async function (req, res, next) {
      const { userId } = req.query;
      try {
        const userMovies = await userMoviesService.getUserMovies({ userId });
        res.status(200);
        res.json({
          data: userMovies,
          message: 'user movies listed',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    scopesValidation(['create:user-movies']),
    validationHandler(createUserMovieSchema),
    async function (req, res, next) {
      const { userMovie } = req.body;
      try {
        const createUserMovieId = await userMoviesService.createUserMovie({
          userMovie,
        });
        res.status(201);
        res.json({
          data: createUserMovieId,
          message: 'user movie created',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    '/:userMovieId',
    passport.authenticate('jwt', { session: false }),
    scopesValidation(['delete:user-movies']),
    validationHandler({ userMovieId: userMovieIdSchema }, 'params'),
    async function (req, res, next) {
      const { userMovieId } = req.params;
      try {
        const deleteUserMovieId = await userMoviesService.deleteUserMovie({
          userMovieId,
        });
        res.status(200);
        res.json({
          data: deleteUserMovieId,
          message: 'user movie deleted',
        });
      } catch (error) {
        next(error);
      }
    }
  );
}

module.exports = userMoviesApi;
