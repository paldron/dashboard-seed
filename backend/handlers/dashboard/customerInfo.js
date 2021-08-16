const moment = require("moment");
const fs = require("fs");
const path = require("path");
const db = global.db;

let sampleData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "sample-response", "revenue-collection.json")
  )
);

// Extract customer information
exports.customerInfo = async function (req, res, next) {
  const dataMode = global.dataMode;
  try {
    const { account } = req.body;
    const refDay = db.getRefDate();
    const currentMonth = moment(refDay).format("YYYY-MM-01");
    const endMonth = moment(refDay).endOf("month").format("YYYY-MM-DD");
    let dataSet =
      dataMode === "sample"
        ? sampleData
        : await db.Initializer.queryDirect(
            `
        Select concat(cs.first_name,' ',cs.last_name) customerName
              ,c.meter_number
              ,ct.category
              ,c.category_id
              ,c.is_sewered
        From dbo.customers cs
        JOIN dbo.connections c
        ON cs.customer_number = c.connection_number
        JOIN dbo.categories ct
        ON c.category_id = ct.category_id
        Where customer_number = @account;
        Select sum(credit) paid
        From dbo.transactions
        Where account_number = @account and trans_date between @currentMonth and @endMonth and revenue_code_id = '1';
        Select startunit, endunit, rate
        From dbo.connections c
        JOIN dbo.progressive_tariffs p
        On IIF(c.prepaid_meter = 1, c.category_id, c.tariff_code) = p.tariff_code
        Where c.connection_number = @account
        Order by p.band;
        Select rate
        From dbo.connections c
        JOIN dbo.sewer_tariffs p
        On IIF(c.prepaid_meter = 1, c.category_id, c.tariff_code) = p.tariff_code
        Where c.connection_number = @account;
        Select rate
        From dbo.connections c
        JOIN dbo.linear_tariffs p
        On IIF(c.prepaid_meter = 1, c.category_id, c.tariff_code) = p.tariff_code
        Where c.connection_number = @account;
    `,
            {
              account,
              currentMonth,
              endMonth,
            }
          );
    return res.status(200).json(dataSet);
  } catch (err) {
    return next(err);
  }
};
