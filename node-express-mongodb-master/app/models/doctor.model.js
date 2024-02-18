module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema({
    //professionalIdentification
    npi: String,
    indPacId: String,
    indEnrlId: String,
    lastName: String,
    firstName: String,
    middleName: String,
    suff: String,
    gndr: String,

    //medicalCredentials: 
    cred: String,
    medSch: String,
    grdYr: Number,
    priSpec: String,
    secSpec1: String,
    secSpec2: String,
    secSpec3: String,
    secSpec4: String,
    secSpecAll: String,

    //medicalPractice
    telehlth: String,
    facilityName: String,
    orgPacId: String,
    numOrgMem: Number,
    adrLn1: String,
    adrLn2: String,
    ln2Sprs: String,
    cityTown: String,
    state: String,
    zipCode: String,
    telephoneNum: String,

    //medicareAssignment
    indAssgn: String,
    grpAssgn: String,

    //reference
    adrsId: String

  }, {
    timestamps: true
  });

  schema.method("toJSON", function () {
    const {
      __v,
      _id,
      ...object
    } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Doctor = mongoose.model("doctor", schema);
  return Doctor;
};