const db = require("../models");
const Doctor = db.doctors;

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return {
    limit,
    offset
  };
};


/*
const MAX_PAGES = 50;

const getPagination = (page, size, totalRecords) => {
  const limit = size ? +size : 10;
  let maxOffset = (MAX_PAGES - 1) * limit;
  const offset = page ? page * limit : 0;
  const totalPages = Math.min(Math.ceil(totalRecords / limit), MAX_PAGES);

  // If the offset exceeds the maxOffset (based on the MAX_PAGES),
  // we reset it to the maxOffset to ensure it doesn't go beyond 50 pages.
  const constrainedOffset = offset > maxOffset ? maxOffset : offset;

  return {
    limit,
    offset: constrainedOffset,
    totalPages // You will send this to the front end to indicate the max number of pages
  };
};
*/
// Create and Save a new Doctor
exports.create = (req, res) => {
  // Validate request by first name
  if (!req.body.firstName) {
    res.status(400).send({
      message: "Content can not be empty! First Name is required."
    });
    return;
  }

  // Create a Doctor
  const doctor = new Doctor({
    //professionalIdentification
    npi: req.body.npi,
    indPacId: req.body.indPacId,
    indEnrlId: req.body.indEnrlId,
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    middleName: req.body.middleName,
    suff: req.body.suff,
    gndr: req.body.gndr,

    //medicalCredentials
    cred: req.body.cred,
    medSch: req.body.medSch,
    grdYr: req.body.grdYr,
    priSpec: req.body.priSpec,
    secSpec1: req.body.secSpec1,
    secSpec2: req.body.secSpec2,
    secSpec3: req.body.secSpec3,
    secSpec4: req.body.secSpec4,
    secSpecAll: req.body.secSpecAll,

    //medicalPractice=
    telehlth: req.body.telehlth,
    facilityName: req.body.facilityName,
    orgPacId: req.body.orgPacId,
    numOrgMem: req.body.numOrgMem,
    adrLn1: req.body.adrLn1,
    adrLn2: req.body.adrLn2,
    ln2Sprs: req.body.ln2Sprs,
    cityTown: req.body.cityTown,
    state: req.body.state,
    zipCode: req.body.zipCode,
    telephoneNum: req.body.telephoneNum,

    //medicareAssignment
    indAssgn: req.body.indAssgn,
    grpAssgn: req.body.grpAssgn,

    //reference
    adrsId: req.body.adrsId

  });

  // Save Doctor in the database
  doctor
    .save(doctor)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Doctor."
      });
    });
};

// Find all Doctors with pagination and optional search by first name, last name
exports.findAll = (req, res) => {
  const {
    page,
    size,
    firstName,
    lastName
  } = req.query;

  let condition = {};

  if (firstName) {
    condition["firstName"] = {
      $regex: new RegExp(firstName),
      $options: "i"
    };
  }

  if (lastName) {
    condition["lastName"] = {
      $regex: new RegExp(lastName),
      $options: "i"
    };
  }

  const {
    limit,
    offset
  } = getPagination(page, size);

  Doctor.paginate(condition, {
      offset,
      limit
    })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        doctors: data.docs,
        totalPages: data.totalPages,
        currentPage: Number(page) // Ensure it's a number
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving doctors."
      });
    });
};

// Find a single Doctor with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Doctor.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found Doctor with id " + id
        });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving Doctor with id=" + id
        });
    });
};

// Update a Doctor by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Doctor.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false
    })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Doctor with id=${id}. Maybe Doctor was not found!`
        });
      } else res.send({
        message: "Doctor was updated successfully."
      });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Doctor with id=" + id
      });
    });
};

// Delete a Doctor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Doctor.findByIdAndRemove(id, {
      useFindAndModify: false
    })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Doctor with id=${id}. Maybe Doctor was not found!`
        });
      } else {
        res.send({
          message: "Doctor was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Doctor with id=" + id
      });
    });
};

// Delete all Doctors from the database.
exports.deleteAll = (req, res) => {
  Doctor.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Doctors were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all doctors."
      });
    });
};

// Find all telehealth Doctors with pagination
exports.findAllTelehealth = (req, res) => {
  const {
    page,
    size
  } = req.query;
  const {
    limit,
    offset
  } = getPagination(page, size);

  Doctor.paginate({
      telehlth: "Y"
    }, {
      offset,
      limit
    }) // Make sure Doctor model has paginate method
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        doctors: data.docs,
        totalPages: data.totalPages,
        currentPage: Number(page) // Ensure it's a number
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving telehealth doctors."
      });
    });
};