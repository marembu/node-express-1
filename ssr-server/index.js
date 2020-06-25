const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const boom = require("@hapi/boom");
const { config } = require("./config/index");

const THIRTY_DAYS_IN_MILSEC = 2592000000;
const TWO_HOURS_IN_MILSEC = 7200000;

const app = express();

app.use(express.json());
app.use(cookieParser());

//BASIC Strategy
require("./utils/auth/strategies/basic");

//
require("./utils/auth/strategies/oauth");

app.post("/auth/sign-in", async function (req, res, next) {
  const { rememberMe } = req.body;
  passport.authenticate("basic", function (error, data) {
    try {
      if (error || !data) {
        next(boom.unauthorized());
      }
      req.login(data, { session: false }, async function (error) {
        if (error) {
          next(boom.unauthorized());
        }

        const { token, ...user } = data;

        res.cookie("token", token, {
          httpOnly: !config.dev,
          secure: !config.dev,
          maxAge: rememberMe ? THIRTY_DAYS_IN_MILSEC : TWO_HOURS_IN_MILSEC,
        });
        res.status(200).json(user);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

app.post("/auth/sign-up", async function (req, res, next) {
  const { body: user } = req;
  try {
    const { data, status } = await axios({
      url: `${config.apiUrl}/api/auth/sign-up`,
      method: "post",
      data: user,
    });

    if (!data || status != 201) {
      next(boom.badImplementation());
    }

    res.status(status).json({ message: data.message });

    //res.status(201).json({message: 'user created'})
  } catch (error) {
    next(error);
  }
});

app.post("/user-movies", async function (req, res, next) {
  const { body: userMovie } = req;
  const { token } = req.cookies;

  const { data, status } = await axios({
    url: `${config.apiUrl}/api/user-movies`,
    method: "post",
    headers: { Authorization: `Bearer ${token}` },
    data: userMovie,
  });

  if (!data || status !== 201) {
    next(boom.badImplementation());
  }

  res.status(status).json({ message: data.message });
  //el mensaje debe ser el mismo que devuelve la api: movie user created
});

app.delete("/user-movies/:userMovieId", async function (req, res, next) {
  const { userMovieId } = req.params;
  const { token } = req.cookies;

  const { data, status } = await axios({
    url: `${config.apiUrl}/api/user-movies/${userMovieId}`,
    method: "delete",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data || status !== 200) {
    next(boom.badImplementation());
  }

  res.status(status).json({ message: data.message });
  //el mensaje debe ser el mismo que devuelve la api: user movie deleted
});

app.get(
  "/auth/google-oauth",
  passport.authenticate("google-oauth", {
    scope: ["email", "profile", "openid"],
  })
);

app.get(
  "/auth/google-oauth/callback",
  passport.authenticate("google-oauth", {
    session: false,
  }),
  async function (req, res, next) {
    if (!req.user) {
      next(boom.unauthorized());
    }
    const { token, ...user } = req.user;
    res.cookie("token", token, {
      httpOnly: !config.dev,
      secure: !config.dev,
    });
    res.status(200).json(user);
  }
);

app.listen(config.port, function () {
  console.log(`Listening http://localhost:${config.port}`);
});
