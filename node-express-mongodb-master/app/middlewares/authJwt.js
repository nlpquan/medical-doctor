const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
const {
  TokenExpiredError
} = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({
      message: "Unauthorized! Access Token was expired!"
    });
  }

  return res.status(401).send({
    message: "Unauthorized!"
  });
}

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(404).send({
        message: "User not found."
      });
    }

    const roles = await Role.find({
      _id: {
        $in: user.roles
      }
    }).exec();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "Require Admin Role!"
    });
  } catch (err) {
    res.status(500).send({
      message: err
    });
  }
};

isModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(404).send({
        message: "User not found."
      });
    }

    const roles = await Role.find({
      _id: {
        $in: user.roles
      }
    }).exec();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "Require Moderator Role!"
    });
  } catch (err) {
    res.status(500).send({
      message: err
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};

module.exports = authJwt;