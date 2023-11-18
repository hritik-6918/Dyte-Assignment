import express from "express";
import bodyParser from "body-parser";
import chalk from "chalk";
import { MONGODB_URI, PORT } from "./config.js";
import mongoose from "mongoose";
import {
  CheckIfUserAuthenticated,
  CheckUserAccessForQueries,
} from "./middleware.js";
import { InjectData, QuerySearch } from "./services.js";
import CONFIG from "./config.json" assert { type: "json" };

const app = express();
const log = console.log;

app.use(bodyParser.json());
app.use(bodyParser({ limit: "50mb" }));

app.post("/injest", async (req, res) => {
  try {
    // Considering that the payload is an array of json objects
    const payload = req.body;
    await InjectData(payload);
    return res.json({ status: "success" });
  } catch (error) {
    log(chalk.red("Error [INJETING LOGS] : "), error);
    return res.status(500).json({ status: "error" });
  }
});

app.post(
  "/search",
  [CheckIfUserAuthenticated, CheckUserAccessForQueries],
  async (req, res) => {
    try {
      let queries = req.query;
      if (queries?.level) queries.level = JSON.parse(queries.level);
      const data = await QuerySearch(queries, req.rolePermissions);
      return res.json({ status: "success", length: data.length, data });
    } catch (error) {
      log(chalk.red("Error [QUERING FOR LOGS] : "), error);
      return res.status(500).json({ status: "error" });
    }
  }
);

function startServer() {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      log(chalk.blue("Log : [CONNECTED TO MONGODB]"));
      app.listen(PORT, () => {
        log(chalk.blue("Log : [SERVER STARTED]"), PORT);
      });
    })
    .catch((err) => {
      log(chalk.red("Error [CONNECTION TO MONGODB] :"), err);
    });
}

startServer();
