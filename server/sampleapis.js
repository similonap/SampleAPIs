const express = require("express");
const expressOasGenerator = require('express-oas-generator');
const path = require("path");
const cors = require("cors");
const GeneratedAPIList = require("./GeneratedAPIList");
const register = require("./routes/generate-key");
const { JWT_SECRET } = require("./config");
const schedule = require('node-schedule');
const fs = require('fs/promises');
const currency = require("currency.js");


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

app.get("/", (req, res) => {
  console.log(GeneratedAPIList);
  res.render("index", {
    apis: GeneratedAPIList
  });
});

app.get("/json", (req, res) => {
  res.json(GeneratedAPIList);
});



app.use("/resetit", reset);
// app.use("/create", create);
// app.use("/custom", custom);
app.use("/generate", generateNewAPIListData);
// app.use("/test",test);
app.use("/token", register);
app.use("/", baseApis);

schedule.scheduleJob('0 0 * * *', async () => {
  await generateAPIListData();
});



schedule.scheduleJob('*/1 * * * *', async () => {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd%2Ceur%2Cgbp&precision=2&include_last_updated_at=true";

  const response = await fetch(url);
  const json = await response.json();

  let bitcoin = await fs.readFile("api/bitcoin.json", "utf8");

  bitcoin = JSON.parse(bitcoin);

  var currConver = value => currency(value, { symbol: "", separator: ",", decimal: "." });

  bitcoin.current.bpi.USD.rate_float = json.bitcoin.usd;
  bitcoin.current.bpi.EUR.rate_float = json.bitcoin.eur;
  bitcoin.current.bpi.GBP.rate_float = json.bitcoin.gbp;
  bitcoin.current.bpi.USD.rate = currConver(json.bitcoin.usd).format();
  bitcoin.current.bpi.EUR.rate = currConver(json.bitcoin.eur).format();
  bitcoin.current.bpi.GBP.rate = currConver(json.bitcoin.gbp).format();
  
  bitcoin.current.time.updated = new Date(json.bitcoin.last_updated_at * 1000).toUTCString();
  bitcoin.current.time.updatedISO = new Date(json.bitcoin.last_updated_at * 1000).toISOString();
  bitcoin.current.time.updateduk = new Date(json.bitcoin.last_updated_at * 1000).toLocaleString("en-GB");

  await fs.writeFile("api/bitcoin.json", JSON.stringify(bitcoin, null, 2));
  await fs.writeFile("api/bitcoin.json.backup", JSON.stringify(bitcoin, null, 2));

});

/** initialize your `app` and routes */

/** place handleRequests as the very last middleware */
expressOasGenerator.handleRequests();

// Starting App
app.listen(port, () => {
  console.log(`App is listening on: http://localhost:${port}`);
});
