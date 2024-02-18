const config = require("../config/auth.config");
const db = require("../models");
const {
  user: User,
  role: Role,
  refreshToken: RefreshToken
} = db;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    // Create a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });

    // Save the user
    const savedUser = await user.save();

    if (req.body.roles) {
      const roles = await Role.find({
        name: {
          $in: req.body.roles
        }
      }).exec();

      savedUser.roles = roles.map(role => role._id);
      await savedUser.save();

      res.send({
        message: "User was registered successfully!"
      });
    } else {
      const role = await Role.findOne({
        name: "user"
      }).exec();
      savedUser.roles = [role._id];
      await savedUser.save();

      res.send({
        message: "User was registered successfully!"
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username
    }).populate("roles", "-__v").exec();
    if (!user) {
      return res.status(404).send({
        message: "User Not found."
      });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    const token = jwt.sign({
      id: user.id
    }, config.secret, {
      expiresIn: config.jwtExpiration, // Set your JWT expiration
    });

    const refreshToken = await RefreshToken.createToken(user); // You need to implement this method

    const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (err) {
    res.status(500).send({
      message: err
    });
  }
};

exports.refreshToken = async (req, res) => {
  const {
    refreshToken: requestToken
  } = req.body;
  if (!requestToken) {
    return res.status(403).json({
      message: "Refresh Token is required!"
    });
  }

  try {
    const refreshToken = await RefreshToken.findOne({
      token: requestToken
    });
    if (!refreshToken) {
      return res.status(403).json({
        message: "Refresh token is not in database!"
      });
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      await RefreshToken.findByIdAndDelete(refreshToken._id).exec();
      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request"
      });
    }

    const newAccessToken = jwt.sign({
      id: refreshToken.user._id
    }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    res.status(500).send({
      message: "Internal server error",
      error: err.message
    });
  }
};