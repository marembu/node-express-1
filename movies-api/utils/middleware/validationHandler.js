const boom = require('@hapi/boom')

function validate(){
    return false
}

function validationHandler(schema, check = 'body'){
    const error = validate(req[check], schema); // eslint-disable-line
    // error ? next(new Error(error)) : next()
    error ? next(boom.badRequest(error)) : next() // eslint-disable-line
}

module.exports = validationHandler