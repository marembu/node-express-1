const passport = require("passport");
const { BasicStrategy } = require("passport-http");
const axios = require("axios");
const { config } = require("../../../config/index");
const boom = require("@hapi/boom");

passport.use(
  new BasicStrategy(async function (email, password, cb) {
    try {
      const response = await axios({
        url: `${config.apiUrl}/api/auth/sign-in`,
        method: "post",
        auth: {
          user: email,
          password,
        },
        data: {
          apiKeyToken: config.apiKeyToken,
        },
      });
      const { data, status } = response;
      if (!data || status != 200) {
        return cb(boom.unauthorized(), false);
      }
      return cb(null, data);
    } catch (error) {
      cb(error);
    }
  })
);
