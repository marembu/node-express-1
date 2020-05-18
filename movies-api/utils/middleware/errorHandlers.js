const { config } = require('../../config/index');
const boom = require('@hapi/boom')

function withErrorStack(error, stack) {
  if (config.dev) {
    return { ...error, stack };
  }
  return error;
}

function logErrors(err, req, res, next) {// eslint-disable-line
  console.log(err);
  next(err);
}

function wrapError(err, req, res, next){// eslint-disable-line
  if( !err.isBoom ){
    next(boom.badImplementation(err))
  }
  next(err)
}

function errorHandler(err, req, res, next) {// eslint-disable-line
  const { output: { statusCode, payload } } = err
  res.status(statusCode);
  res.json(withErrorStack(payload, err.stack));
  // res.status(err.status || 500);
  // res.json(withErrorStack(err.message, err.stack));
}

module.exports = {
  logErrors,
  wrapError,
  errorHandler,
};
