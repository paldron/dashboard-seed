"use strict";

module.exports = class Initializer {
  constructor(db) {
    this.db = db;
  }

  query(procedure, params, filter = {}, forDelete = false) {
    return new Promise((resolve, reject) => {
      this.db.processProcedure(
        procedure,
        params,
        function (err, result) {
          if (err) {
            console.log("Sql Error", err.message);
            reject({ message: err.message });
            return;
          }
          if (forDelete) resolve(result.rowsAffected);
          else resolve(result.recordsets);
        },
        { stream: false, ...filter }
      );
    });
  }

  queryDirect(query, params, filter = {}, forDelete = false) {
    return new Promise((resolve, reject) => {
      this.db.queryStatement(
        query,
        [params],
        function (err, result) {
          if (err) {
            console.log("Sql Error", err.message);
            reject({ message: err.message });
            return;
          }
          if (forDelete) resolve(result.rowsAffected);
          else resolve(result.recordsets);
        },
        { stream: false, ...filter }
      );
    });
  }
};
