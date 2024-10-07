const express = require("express");
const router = express.Router();
const path = require("path");
const jsonServer = require("json-server");
const jsonGraphqlExpress = require("json-graphql-server");
const fs = require("fs");

const { apiLimits } = require("../utils/rateLimiterDefaults");
const { getFromFile } = require("../utils/utils");
const { decrypt } = require("../encryption");

const { verifyData } = require("../utils/verifyData");
const GeneratedAPIList = require("../GeneratedAPIList");

const init = async () => {
  GeneratedAPIList.forEach(({ link }) => {
    const dataPath = path.join(__dirname, `../api/${link}.json`);
    const data = getFromFile(dataPath);

    try {
      router.use(`/${link}/graphql`, apiLimits, jsonGraphqlExpress.default(data));
    } catch (err) {
      console.log(`Unable to set up /${link}/graphql`);
      console.error(err);
    }
  });
  GeneratedAPIList.forEach(({ link }) => {
    router.use(`/${link}`, verifyData, apiLimits, (req, res, next) => {

      let hash = req.headers["authorization"];
      if (hash) {
        if (hash.includes("Bearer ")) {
          hash = hash.split("Bearer ")[1];
          try {
            let email = decrypt(hash);
          } catch (e) {
            res.status(401).json({
              response: 401,
              data: {
                message: "Invalid Authorization header",
              },
            });
            return;
          }
        }
      }

      let dataPath = path.join(__dirname, `../api/${link}.json`);

      if (!hash && (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE")) {
        res.status(400).json({
          response: 400,
          data: {
            message: "You can only use POST, PUT, PATCH, DELETE methods without an Authorization header.",
          },
        });
        return;
      }

      if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
        dataPath = hash ? path.join(__dirname, `../api/${link}_${hash}.json`) : dataPath;

        if (!fs.existsSync(dataPathWithHash)) {
          fs.cpSync(dataPath, dataPathWithHash);
        }
      }

      if (req.query._page === undefined) {
        req.query._page = 1;
      }
      if (req.query._limit === undefined) {
        req.query._limit = 20;
      }

      jsonServer.router(dataPath)(req, res, next);
      // req.next();
    });

  });
};

init();

module.exports = router;
