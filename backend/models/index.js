const moment = require("moment");

const SqlRepo = require("./../repositories/sql_server");
const sqlDB = new SqlRepo();
const Initializer = require("./initializer");

module.exports.Initializer = new Initializer(sqlDB);

module.exports.getRefDate = () =>
  moment()
    .set("month", 12 - 1)
    .set("year", 2020);
