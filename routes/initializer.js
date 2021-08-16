const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  fetchCommonParams
} = require("../handlers/initializer");

router.route("/commondata").get(fetchCommonParams);

module.exports = router;
