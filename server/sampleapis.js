const express = require("express");
const expressOasGenerator = require('express-oas-generator');
const path = require("path");
const cors = require("cors");
const GeneratedAPIList = require("./GeneratedAPIList");
const register = require("./routes/generate-key");
const { JWT_SECRET } = require("./config");

if (!JWT_SECRET) {
  console.log("JWT_SECRET is not set properly");
  process.exit(1);
}

// Express App
const app = express();
expressOasGenerator.handleResponses(app, {});
const port = process.env.PORT || 5555;

// JSON Parser

// parse application/json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Files
app.use("/", express.static(path.join(__dirname, "/public")));

// View Engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));

// CORS
app.use(cors());

// For debugging;
// app.use(morgan('dev'));

// Routes
const reset = require("./routes/reset");
const baseApis = require("./routes/base-apis");
const frontend = require("./routes/frontend");
const test = require("./routes/testApis");

app.use("/frontend", frontend);

const create = require("./routes/create-apis");

const { generateAPIListData } = require("./utils/getAPIListData");
const generateNewAPIListData = async (req, res) => {
  await generateAPIListData();

  res.json({
    response: 200,
    data: {
      message: "Created",
    },
  });
};

const ApiList = require("./apiList");

app.get("/", (req, res) => {
  // res.json(GeneratedAPIList);
  // console.log(ApiList);
  res.render("index", {
    apis: ApiList
  });
});

app.get("/json", (req, res) => {
  res.json(GeneratedAPIList);
});



// app.use("/resetit", reset);
// app.use("/create", create);
// app.use("/custom", custom);
app.use("/generate", generateNewAPIListData);
// app.use("/test",test);
app.use("/token", register);
app.use("/", baseApis);


/** initialize your `app` and routes */

/** place handleRequests as the very last middleware */
expressOasGenerator.handleRequests();

// Starting App
app.listen(port, () => {
  console.log(`App is listening on: http://localhost:${port}`);
});
