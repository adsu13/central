const express = require("express");
const cors = require("cors");
const functions = require("./src/functions/index");

functions.loadBins();

const app = express();
// var corsOptions = {
//   origin: "http://localhost:8080"
// };
app.use(cors());
// app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./src/models");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to the database!");

    const count = await db.users.countDocuments();

    if (count == 0) {
      let token = functions.newToken(32);
      const user = await db.users.create({
        token: token,
        nickname: "Security",
        balance: 999999,
        admin: true,
      });
      console.log("user Security as been created token: " + user.token);
    }
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

require("./src/routes/gateways.routes")(app);
require("./src/routes/users.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
