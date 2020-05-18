const express = require('express');
const { config } = require('./config/index');
const app = express();
const moviesApi = require('./routes/movies');
const { logErrors, errorHandler } = require('./utils/middleware/errorHandlers')

//body parser
app.use(express.json());
//routes
moviesApi(app);
//error handler
app.use(logErrors)
app.use(errorHandler)
app.listen(config.port, function () {
  console.log(`Listening http://localhost:${config.port}`);
});

// app.get('/', function (req, res) {
//   res.send('hello Mario');
// });

// app.get('/nikky', function (req, res) {
//   res.json({ hello: 'Nikky' });
// });

// app.get('/anyo-bisiesto-checker', function (req, res) {
//   let anyo = req.query.anyo;
//   let anyoBisiesto = (anyo % 4 == 0 && anyo % 100 != 0) || anyo % 400 == 0;
//   res.send(`El año ${anyoBisiesto ? 'es bisiesto' : 'no es bisiesto'}.`);
// });
