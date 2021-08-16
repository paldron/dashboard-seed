const moment = require("moment");
const fs = require("fs");
const path = require("path");
const db = global.db;
const { promisify } = require("util");
const subscriber = global.subscriber;
const publisher = global.publisher;

let _IS_FETCHING = false;
let _FETCH_INITIATOR = false;
let loadCallback = null;
let sampleData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "sample-response", "revenue-collection.json")
  )
);

subscriber.on("message", function (channel, message) {
  if (channel === "revenue_fetch") {
    _IS_FETCHING = message === "true" ? true : false;
  } else if (channel === "revenue_load") {
    if (loadCallback) loadCallback(message);
  }
});

subscriber.subscribe("revenue_fetch");
subscriber.subscribe("revenue_load");

const redisClient = subscriber.duplicate();
const getAsync = promisify(redisClient.get).bind(redisClient);

exports.revenueCollection = async function (req, res, next) {
  try {
    const dataMode = global.dataMode;
    // console.log("NEW REQUEST");
    let saCache = await getAsync("Revenue");
    if (!saCache && !_IS_FETCHING) {
      // console.log("FRESH FETCH");
      _FETCH_INITIATOR = true;
      publisher.publish("revenue_fetch", "true");
      let dataSet =
        dataMode === "sample"
          ? sampleData
          : await db.Initializer.queryDirect(getPreparedQuery());
      let dataStr = JSON.stringify(dataSet);
      redisClient.set("Revenue", dataStr, "EX", 70);
      publisher.publish("revenue_load", dataStr);
      publisher.publish("revenue_fetch", "false");
      _FETCH_INITIATOR = false;
      return res.headersSent ? dataSet : res.status(200).json(dataSet);
    } else if (!saCache && _IS_FETCHING) {
      // console.log("WAITING FOR FETCH");
      loadCallback = (load) => {
        // console.log("FETCH SERVED");
        if (!res.headersSent) res.status(200).json(JSON.parse(load));
      };
    } else {
      // console.log("USING CACHE");
      return res.headersSent
        ? dataSet
        : res.status(200).json(JSON.parse(saCache));
    }
  } catch (err) {
    if (_FETCH_INITIATOR) publisher.publish("revenue_fetch", "false");
    _FETCH_INITIATOR = false;
    return res.headersSent ? null : next(err);
  }
};

const getPreparedQuery = () => {
  const refDay = db.getRefDate();
  const todayMoment = moment(refDay);
  const today = todayMoment.format("DD");
  //const todayDate = todayMoment.format('YYYY-MM-DD');
  const todayTime = todayMoment.format("YYYY-MM-DD HH:mm:ss");
  //const todayRefDateTemp = todayMoment.subtract(30,'minutes')
  const todayRefTime = todayMoment
    .subtract(30, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
  const monthStart = todayMoment.startOf("month");
  const startDate = monthStart.format("YYYY-MM-DD");
  const prevMonthDate = monthStart.subtract(1, "days");
  const lastDay = prevMonthDate.format("DD");
  const prevEndDate = prevMonthDate.format("YYYY-MM-DD");
  const prevStartDate = prevMonthDate.format("YYYY-MM-01");
  const refDate =
    today > lastDay ? prevEndDate : prevMonthDate.format(`YYYY-MM-${today}`);
  const endDate = moment(refDay).format("YYYY-MM-DD"); //moment(refDay).endOf('month').format('YYYY-MM-DD');

  return `SELECT c.zone_id zone
                ,z.street
                ,sum(t.credit) collections
                ,sum(ISNULL(pr.sewer,t.sewer)) sewer
                ,sum(t.service) service
                ,count(t.serial_no) transactions
                ,cast(t.trans_date as date) trans_date
            FROM dbo.transactions t
            JOIN dbo.connections c
            ON t.account_number = c.connection_number or t.other_ref = c.connection_number
            LEFT JOIN zone_and_route_def z
            ON c.zone_id = z.zone and c.route = z.route
            LEFT JOIN [dbo].[light_prepaid_payments] pr
            ON t.trans_ref_no = pr.receipt and t.revenue_code_id = '18'
            WHERE t.trans_date between '${startDate}' and '${endDate}' and t.revenue_code_id IN( '1','18')
            GROUP BY c.zone_id, z.street, cast(t.trans_date as date);


            SELECT n.zone_id zone, z.street
                ,sum(IIF(t.revenue_code_id = '4',credit,0)) water
                ,sum(IIF(t.revenue_code_id = '30',credit,0)) sewer
                ,sum(credit) total_collection
                ,count(t.serial_no) transactions
                ,cast(t.trans_date as date) trans_date
            FROM dbo.transactions t
            JOIN dbo.new_connection_application n
            ON t.other_ref = n.ref_no
            LEFT JOIN dbo.zone_and_route_def z
            ON n.zone_id = z.zone and n.route = z.route
            WHERE t.revenue_code_id IN('4','30') and trans_date between '${startDate}' and '${endDate}'
            GROUP BY n.zone_id, z.street, cast(t.trans_date as date);

            SELECT r.revenue_description revenue
                  ,sum(t.credit) collections
                  ,count(t.serial_no) transactions
                  ,cast(t.trans_date as date) trans_date
                  ,sum(IIF(t.revenue_code_id IN( '1','18'),t.credit,0)) water_only
            FROM dbo.transactions t
            JOIN dbo.revenue_codes r
            ON t.revenue_code_id = r.revenue_code_id
            WHERE trans_date between '${startDate}' and '${endDate}' and t.adjustment <> 1 and t.credit > 0 
            GROUP BY r.revenue_description, cast(t.trans_date as date)
            ORDER BY r.revenue_description, trans_date;

            SELECT c.zone_id zone
                ,z.street
                ,sum(IIF(t.revenue_code_id IN('1','18') and t.trans_date <= '${refDate}',t.credit,0)) collections
                ,sum(IIF(t.revenue_code_id IN('1','18') and t.trans_date <= '${refDate}',ISNULL(pr.sewer,t.sewer),0)) sewer
                ,sum(IIF(t.revenue_code_id = '1' and t.trans_date <= '${refDate}',t.service,0)) service
                ,sum(IIF(t.revenue_code_id = '7' and t.trans_date <= '${refDate}',t.credit,0)) recon_collections
                ,sum(IIF(t.revenue_code_id = '0' and a.customer_number is null,t.debit,0)) charge
                ,sum(IIF(t.revenue_code_id = '0',IIF(a.customer_number is null,IIF(t.opening_balance < 0,0,t.opening_balance),0),0)) opening
                ,cast(t.trans_date as date) trans_date
            FROM dbo.transactions t
            JOIN dbo.connections c
            ON t.account_number = c.connection_number or t.other_ref = c.connection_number
            LEFT JOIN [dbo].[customers] a
            ON c.connection_number = a.customer_number and a.paying_agent IN('MGZ','CCP','RPC')
            LEFT JOIN zone_and_route_def z
            ON c.zone_id = z.zone and c.route = z.route
            LEFT JOIN [dbo].[light_prepaid_payments] pr
            ON t.trans_ref_no = pr.receipt and t.revenue_code_id = '18'
            WHERE trans_date between '${prevStartDate}' and '${prevEndDate}' and t.revenue_code_id IN ('1','0','7','18') 
            GROUP BY c.zone_id, z.street, cast(t.trans_date as date);

            SELECT c.zone_id zone
                ,z.street
                ,sum(credit) collections
                ,count(t.serial_no) transactions
                ,cast(t.trans_date as date) trans_date
            FROM dbo.transactions t
            JOIN dbo.connections c
            ON t.account_number = c.connection_number
            LEFT JOIN zone_and_route_def z
            ON c.zone_id = z.zone and c.route = z.route
            WHERE trans_date between '${startDate}' and '${endDate}' and revenue_code_id = '7' and t.credit > 0
            GROUP BY c.zone_id, z.street, cast(t.trans_date as date);

            SELECT n.zone_id zone
                ,z.street
                ,sum(IIF(t.revenue_code_id = '30' and t.trans_date <= '${refDate}',credit,0)) con_sewer
                ,sum(IIF(t.revenue_code_id = '4' and t.trans_date <= '${refDate}',credit,0)) con_water
                ,cast(t.trans_date as date) trans_date
            FROM dbo.transactions t
            JOIN dbo.new_connection_application n
            ON t.other_ref = n.ref_no
            LEFT JOIN zone_and_route_def z
            ON n.zone_id = z.zone and n.route = z.route
            WHERE trans_date between '${prevStartDate}' and '${prevEndDate}' and revenue_code_id IN ('4','30')
            GROUP BY n.zone_id, z.street, cast(t.trans_date as date);

            SELECT r.revenue_description revenue
                  ,sum(t.credit) ref_collections
                  ,count(t.serial_no) ref_transactions
                  ,cast(t.trans_date as date) trans_date
            FROM dbo.transactions t
            JOIN dbo.revenue_codes r
            ON t.revenue_code_id = r.revenue_code_id
            WHERE trans_date between '${prevStartDate}' and '${refDate}' and t.adjustment <> 1 and t.credit > 0 
            GROUP BY r.revenue_description, cast(t.trans_date as date)
            ORDER BY r.revenue_description, trans_date;

            SELECT d.[Description] complaint,cs.zone_id zone, z.street
              ,count(IIF(c.done = 1,c.complaint_number,null)) resolved
              ,count(IIF(c.done = 0 and c.received = 1,c.complaint_number,null)) in_progress
              ,count(IIF(c.done = 0 and ISNULL(c.received,0) <> 1,c.complaint_number,null)) unattended
              ,cast(c.date_reported as date) comp_date
            FROM customer_complaints c
            JOIN dbo.customer_complaints_description d
            ON c.complaint_id = d.ComplaintId
            JOIN dbo.connections cs
            ON c.account_number = cs.connection_number
            LEFT JOIN zone_and_route_def z
            ON cs.zone_id = z.zone and cs.route = z.route
            WHERE c.date_reported between '${startDate}' and '${endDate}'
            GROUP BY d.[Description],cast(c.date_reported as date),cs.zone_id, z.street;

            SELECT d.[Description] complaint,cs.zone_id zone, z.street
              ,count(IIF(c.done = 1,c.complaint_number,null)) ref_resolved
              ,count(IIF(c.done = 0 and c.received = 1,c.complaint_number,null)) ref_in_progress
              ,count(IIF(c.done = 0 and ISNULL(c.received,0) <> 1,c.complaint_number,null)) ref_unattended
              ,cast(c.date_reported as date) comp_date
            FROM customer_complaints c
            JOIN dbo.customer_complaints_description d
            ON c.complaint_id = d.ComplaintId
            JOIN dbo.connections cs
            ON c.account_number = cs.connection_number
            LEFT JOIN zone_and_route_def z
            ON cs.zone_id = z.zone and cs.route = z.route
            WHERE c.date_reported between '${prevStartDate}' and '${refDate}'
            GROUP BY d.[Description],cast(c.date_reported as date),cs.zone_id, z.street;

            SELECT SUM([PaidAmt]/2) collection_rate
            FROM [dbo].[gepg_payments]
            WHERE TrxDtTm between '${todayRefTime}' and '${todayTime}';`;
};
