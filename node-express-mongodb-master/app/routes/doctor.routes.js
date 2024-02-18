module.exports = app => {
  const doctors = require("../controllers/doctor.controller.js");
  const {
    authJwt
  } = require("../middlewares"); // Import the auth middleware

  var router = require("express").Router();

  // Create a new Doctor (secured)
  router.post("/", [authJwt.verifyToken, authJwt.isModerator], doctors.create);

  // Retrieve all Doctors
  router.get("/", doctors.findAll);

  // Retrieve all telehealth service Doctors
  router.get("/telehlth", doctors.findAllTelehealth);

  // Retrieve a single Doctor with id
  router.get("/:id", doctors.findOne);

  // Update a Doctor with id (secured)
  router.put("/:id", [authJwt.verifyToken, authJwt.isModerator], doctors.update);

  // Delete a Doctor with id (secured)
  router.delete("/:id", [authJwt.verifyToken, authJwt.isModerator], doctors.delete);

  // Delete all Doctors (secured)
  router.delete("/", [authJwt.verifyToken, authJwt.isModerator], doctors.deleteAll);

  app.use("/api/doctors", router);
};