const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const boom = require("@hapi/boom");
const { config } = require("./config/index");

const app = express();

app.use(express.json());
app.use(cookieParser());

require("./utils/auth/strategies/basic");

app.post("/", async function (req, res, next) {
  passport.authenticate("basic", function (error, data) {
    if (error || !data) {
      next(boom.unautorized());
    }
    req.logIn(data, async function (error) {
      if (error) {
        next(boom.unautorized());
      }

      const { token, ...user } = data;

      res.cookie("token", token, {
        httpOnly: !config.dev,
        secure: !config.dev,
      });
      res.status(200).json(user);
    });
  })(req, res, next);
});

app.post("/sign-up", async function (req, res, next) {
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
