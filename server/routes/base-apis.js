const express = require("express");
const router = express.Router();
const path = require("path");
const jsonServer = require("json-server");
const jsonGraphqlExpress = require("json-graphql-server");
const fs = require("fs");

const { apiLimits } = require("../utils/rateLimiterDefaults");
const { getFromFile } = require("../utils/utils");
const { JWT_SECRET } = require("../config");
const jwt = require('jsonwebtoken');
const { verifyData } = require("../utils/verifyData");
const GeneratedAPIList = require("../GeneratedAPIList");

const authorizationMiddleware = (req, res, next) => {
  let authorization = req.headers["authorization"];
  if (authorization) {
    if (authorization.includes("Bearer ")) {
      authorization = authorization.split("Bearer ")[1];
      try {
        let email = jwt.verify(authorization, JWT_SECRET).email;
        // store email in req object
        req.email = email;
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
  next();
}


const init = async () => {
  GeneratedAPIList.forEach(({ link }) => {
    const dataPath = path.join(__dirname, `../api/${link}.json`);
    const data = getFromFile(dataPath);


    try {
      router.use(`/${link}/graphql`, apiLimits, jsonGraphqlExpress.default(data));
    } catch (err) {
      console.log(link, data);

      console.log(`Unable to set up /${link}/graphql`);
      console.error(err);
    }
  });
  GeneratedAPIList.forEach(({ link }) => {
    router.use(`/${link}`, authorizationMiddleware, verifyData, apiLimits, (req, res, next) => {
      const email = req.email;
      const dataPath = path.join(__dirname, `../api/${link}.json`);
      const dataPathWithEmail = email ? path.join(__dirname, `../api/${link}_${email}.json`) : dataPath;

      if (!email && (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE")) {
        res.status(400).json({
          response: 400,
          data: {
            message: "You must be authenticated to perform this action",
          },
        });
        return;
      }

      if (!fs.existsSync(dataPathWithEmail)) {
        fs.cpSync(dataPath, dataPathWithEmail);
      }

      jsonServer.router(dataPathWithEmail)(req, res, next);
      // req.next();
    });

  });
};

init();

module.exports = router;
