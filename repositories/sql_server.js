const sql = require("mssql");
// const constants = require("./common").constants;

function SqlDB(config = null) {
  let pool = null;

  this.getPool = function () {
    return pool;
  };

  this.setPool = function (p) {
    pool = p;
  };

  this.initPool = async function () {
    try {
      if (pool == null)
        pool = await new sql.ConnectionPool(this.getConfig()).connect();
    } catch (error) {
      global.dataMode = "sample";
      console.error(
        (error && error.message) || "Failed to connect to the database."
      );
    }
  };

  this.closePool = function () {
    if (pool != null) pool.close();
  };

  this.getConfig = function () {
    if (config == undefined || config == null) {
      config = {
        user: "john",
        password: "doe",
        server: "localhost",
        database: "test_server",
        connectionTimeout: 3500,
        requestTimeout: 250000,
        pool: { max: 2, min: 1, idleTimeoutMillis: 70000 },
        options: { encrypt: false },
      };
    }
    return config;
  };

  this.initPool();
}

// Query with parameter object wrapper
SqlDB.prototype.queryStatement = async function (
  sqlString,
  params = [],
  callback = null,
  filter = { stream: false }
) {
  try {
    //console.time("Query time");
    if (callback == null) throw Error("No callback function");

    let pool = this.getPool(),
      that = this;
    if (pool == null) {
      // Renew pool connection
      pool = await new sql.ConnectionPool(this.getConfig()).connect();
      this.setPool(pool);
    }

    const ps = new sql.PreparedStatement(pool);
    let withParams = false;
    if (params != null && params[0] != undefined) {
      Object.keys(params[0]).forEach(function (key) {
        ps.input(key, sql.getTypeByValue(params[0][key]));
      });
      withParams = true;
    }

    ps.prepare(sqlString, (err) => {
      if (err) {
        callback(err);
        return;
      }

      if (filter.stream) {
        ps.stream = true;
        that.execQueryStatementStream(
          ps,
          withParams ? params : null,
          callback,
          filter
        );
      } else {
        that.execQueryStatement(
          ps,
          withParams ? params : null,
          callback,
          filter
        );
      }
    });
  } catch (err) {
    if (callback != null) callback(err);
    else console.error(err);
  }
};

SqlDB.prototype.execQueryStatement = function (
  ps,
  params,
  callback,
  filter = null
) {
  var that = this,
    param = params == null ? {} : params.shift();

  param = param == undefined ? {} : param;

  ps.execute(param, (err, result) => {
    //console.timeEnd("Query time");
    callback(err, result);

    if (params != null && params.length > 0) {
      that.execQueryStatement(ps, params, callback, filter);
    } else {
      ps.unprepare((err) => {
        if (err) callback(err);
      });
    }
  });
};

SqlDB.prototype.execQueryStatementStream = function (
  ps,
  params,
  callback,
  filter = null
) {
  var that = this,
    param = params == null ? {} : params.shift();

  param = param == undefined ? {} : param;

  const request = ps.execute(param, (err, result) => {});

  request.on("recordset", (columns) => {
    // Emitted once for each recordset in a query
    //console.log("Columns: ",columns);
  });

  request.on("row", (row) => {
    // Emitted for each row in a recordset
    callback(null, row);
  });

  request.on("error", (err) => {
    // May be emitted multiple times
    callback(err);
  });

  request.on("done", (result) => {
    // Always emitted as the last one
    callback(null, result);

    if (params != null && params.length > 0) {
      that.execQueryStatementStream(ps, params, callback, filter);
    } else {
      ps.unprepare((err) => {
        if (err) callback(err);
      });
    }
  });
};

// Procedure call helper function
SqlDB.prototype.processProcedure = async function (
  procedure,
  params = {},
  callback = null,
  filter = { stream: false }
) {
  try {
    if (callback == null) throw Error("No callback function");
    if (procedure == null) throw Error("No execution procedure");
    let pool = this.getPool(),
      that = this;
    if (pool == null) {
      pool = await new sql.ConnectionPool(this.getConfig()).connect();
      this.setPool(pool);
    }

    const request = new sql.Request(pool);

    let paramKeys = Object.keys(params);

    for (var k = 0; k < paramKeys.length; k++) {
      var key = paramKeys[k];
      if (Array.isArray(params[key])) {
        throw new Error("Write your array parameter handler");
      } else {
        request.input(key, sql.getTypeByValue(params[key]), params[key]);
      }
    }

    if (filter.stream) {
      request.stream = true;
      request.execute(procedure);
      request.on("recordset", (columns) => {
        // Emitted once for each recordset in a query
        //console.log("Columns: ",columns);
      });

      request.on("row", (row) => {
        // Emitted for each row in a recordset
        callback(null, row);
      });

      request.on("error", (err) => {
        callback(err);
      });

      request.on("done", (result) => {
        callback(null, result);
      });
    } else {
      request.stream = false;
      request.execute(procedure, (err, result) => {
        callback(err, result);
      });
    }
  } catch (err) {
    if (callback != null) callback(err);
    else console.error(err);
  }
};

module.exports = SqlDB;
