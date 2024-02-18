const express = require("express");
const cors = require("cors");

const app = express();

// CORS options
var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));

// Database setup
const db = require("./app/models");
const Role = db.role;

// Connecting to the database
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connected to the database.");
    initial(); // Initialize roles in the database
  })
  .catch(err => {
    console.error("Cannot connect to the database!", err);
    process.exit();
  });

// Initial function for setting up roles
async function initial() {
  try {
    const count = await Role.estimatedDocumentCount();
    if (count === 0) {
      // Create roles
      await new Role({
        name: "user"
      }).save();
      console.log("added 'user' to roles collection");

      await new Role({
        name: "moderator"
      }).save();
      console.log("added 'moderator' to roles collection");

      await new Role({
        name: "admin"
      }).save();
      console.log("added 'admin' to roles collection");
    }
  } catch (err) {
    console.error("initial setup error:", err);
  }
}


// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application."
  });
});

require("./app/routes/doctor.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});