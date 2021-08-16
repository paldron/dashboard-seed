const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  revenueCollection,
  saReadings,
  customerInfo
} = require("../handlers/dashboard");

router.route("/revenueCollection").get(revenueCollection);
router.route("/saReadings").get(saReadings);
router.route("/customerInfo").post(customerInfo);

module.exports = router;