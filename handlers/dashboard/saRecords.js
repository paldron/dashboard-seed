const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const db = global.db;
const subscriber = global.subscriber;
const publisher = global.publisher;

let _IS_FETCHING = false;
let _FETCH_INITIATOR = false;
let loadCallback = null;
let sampleData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "sample-response", "sa-readings.json")
  )
);

subscriber.on("message", function (channel, message) {
  if (channel === "readings_fetch") {
    _IS_FETCHING = message === "true" ? true : false;
  } else if (channel === "readings_load") {
    if (loadCallback) loadCallback(message);
  }
});

subscriber.subscribe("readings_fetch");
subscriber.subscribe("readings_load");

const redisClient = subscriber.duplicate();
const getAsync = promisify(redisClient.get).bind(redisClient);

exports.saReadings = async function (req, res, next) {
  try {
    const dataMode = global.dataMode;
    // console.log("NEW REQUEST");
    let saCache = await getAsync("SaReadings");
    if (!saCache && !_IS_FETCHING) {
      // console.log("FRESH FETCH");
      _FETCH_INITIATOR = true;
      publisher.publish("readings_fetch", "true");
      let dataSet =
        dataMode === "sample"
          ? [sampleData]
          : await db.Initializer.query("P_Sa_Readings_2", {
              start_date: db.getRefDate().format("YYYY-MM-DD"),
            });
      let dataStr = JSON.stringify(dataSet[0]);
      redisClient.set("SaReadings", dataStr, "EX", 21);
      publisher.publish("readings_load", dataStr);
      publisher.publish("readings_fetch", "false");
      _FETCH_INITIATOR = false;
      return res.headersSent ? dataSet : res.status(200).json(dataSet[0]);
    } else if (!saCache && _IS_FETCHING) {
      // console.log("WAITING FOR FETCH");
      loadCallback = (load) => {
        if (!res.headersSent) res.status(200).json(JSON.parse(load));
      };
    } else {
      // console.log("USING CACHE");
      return res.headersSent
        ? dataSet
        : res.status(200).json(JSON.parse(saCache));
    }
  } catch (err) {
    if (_FETCH_INITIATOR) publisher.publish("readings_fetch", "false");
    _FETCH_INITIATOR = false;
    return res.headersSent ? null : next(err);
  }
};
