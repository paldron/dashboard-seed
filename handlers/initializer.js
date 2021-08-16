const moment = require("moment");
const fs = require("fs");
const path = require("path");
const db = global.db;

let sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sample-response", "common-data.json"))
);

// Extract collection and operations data of current month along with
// previous month data on the same reference date
// eg 9 Oct 2020 as current date and 9 Sep 2021 as previous month reference date
exports.fetchCommonParams = async function (req, res, next) {
  const dataMode = global.dataMode;
  try {
    const refDay = db.getRefDate();
    const currentDate = refDay.format("YYYY-MM-DD");
    const today = moment(refDay).format("DD");
    const currentMonth = parseInt(moment(refDay).format("MM"), 10);
    const currentYear = parseInt(moment(refDay).format("YYYY"), 10);
    const finYearStart = `${
      currentMonth < 7 ? currentYear - 1 : currentYear
    }-07-01`;
    const monthStart = moment(refDay).startOf("month");
    const startDate = monthStart.format("YYYY-MM-DD");

    const prevMonthDate = monthStart.subtract(1, "days");

    const lastDay = prevMonthDate.format("DD");
    const prevEndDate = prevMonthDate.format("YYYY-MM-DD");
    const prevStartDate = prevMonthDate.format("YYYY-MM-01");
    const refDate =
      today > lastDay ? prevEndDate : prevMonthDate.format(`YYYY-MM-${today}`);
    const endDate = moment(refDay).format("YYYY-MM-DD");
    busyFetching = true;

    const prevBill = prevMonthDate.format("MMMYYYY");
    const curBill = refDay.format("MMMYYYY");
    const queryStm = `
    SELECT z.zone
          ,z.street
          ,count(IIF(cb.disconnection_status = 'Connected',c.connection_number, null)) active_customers
          ,count(IIF(cb.disconnection_status <> 'Connected',c.connection_number, null)) inactive_customers
          ,count(IIF(c.date_connected between '${startDate}' and '${currentDate}', c.connection_number, null)) connected_customers
          ,z.sa_id
          ,count(IIF(pb.[reading_date] between '${prevStartDate}' and '${refDate}',c.connection_number, null)) proj_readings
          ,count(IIF(cb.[reading_date] >= '${startDate}',c.connection_number, null)) current_readings
          ,sum(IIF(cb.[current_consumption] < 0,0,cb.[current_consumption])) current_cons
          ,sum(IIF(pb.[current_consumption] < 0,0,pb.[current_consumption])) previous_cons
          ,sum(IIF(pb.[reading_date] between '${prevStartDate}' and '${refDate}',pb.current_consumption, 0)) proj_previous_cons
    FROM dbo.connections c
    JOIN dbo.bills_history cb
    ON c.connection_number = cb.account_number and cb.[month] = '${curBill}'
    LEFT JOIN dbo.bills_history pb
    ON c.connection_number = pb.account_number and pb.[month] = '${prevBill}'
    RIGHT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE z.route > 0 and (c.archived = 0 or c.connection_number is null) 
    GROUP BY z.zone, z.street,z.sa_id
    ORDER BY z.zone, z.street,z.sa_id;

    SELECT zone FROM dbo.zones;

    SELECT DISTINCT s.[sales_assistant_id] sa_id
          ,s.[sales_assistant_name] staff_name
    FROM dbo.sales_assistants s
    JOIN dbo.zone_and_route_def z
    ON sales_assistant_id = z.sa_id
    ORDER BY staff_name;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) readings
          ,sum(IIF(b.[current_consumption] < 0,0,b.[current_consumption])) consumption
          ,z.sa_id
          ,b.reading_date read_day
    FROM dbo.connections c
    JOIN dbo.bills_history b
    ON c.connection_number = b.account_number and b.[month] = '${curBill}'
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and b.reading_date <= '${endDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, b.reading_date
    ORDER BY c.zone_id, z.street,z.sa_id, read_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) readings
          ,sum(IIF(b.[current_consumption] < 0,0,b.[current_consumption])) consumption
          ,z.sa_id
          ,b.reading_date read_day
    FROM dbo.connections c
    JOIN dbo.bills_history b
    ON c.connection_number = b.account_number and b.[month] = '${prevBill}'
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and b.reading_date <= '${refDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, b.reading_date
    ORDER BY c.zone_id, z.street,z.sa_id, read_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) customers
          ,z.sa_id
          ,date_connected con_day
    FROM dbo.connections c
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and date_connected between '${startDate}' and '${endDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, date_connected
    ORDER BY c.zone_id, z.street,z.sa_id, con_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) customers
          ,z.sa_id
          ,date_connected con_day
    FROM dbo.connections c
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and date_connected between '${prevStartDate}' and '${refDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, date_connected
    ORDER BY c.zone_id, z.street,z.sa_id, con_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) customers
          ,z.sa_id
          ,date_disconnected con_day
    FROM dbo.connections c
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and date_disconnected between '${startDate}' and '${endDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, date_disconnected
    ORDER BY c.zone_id, z.street,z.sa_id, con_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) customers
          ,z.sa_id
          ,date_disconnected con_day
    FROM dbo.connections c
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and date_disconnected between '${prevStartDate}' and '${refDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, date_disconnected
    ORDER BY c.zone_id, z.street,z.sa_id, con_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) customers
          ,z.sa_id
          ,date_reconnected con_day
    FROM dbo.connections c
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and date_reconnected between '${startDate}' and '${endDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, date_reconnected
    ORDER BY c.zone_id, z.street,z.sa_id, con_day;

    SELECT c.zone_id zone
          ,z.street
          ,count(c.connection_number) customers
          ,z.sa_id
          ,date_reconnected con_day
    FROM dbo.connections c
    LEFT JOIN dbo.zone_and_route_def z
    ON c.zone_id = z.zone and c.route = z.route
    WHERE c.archived = 0 and date_reconnected between '${prevStartDate}' and '${refDate}'
    GROUP BY c.zone_id, z.street,z.sa_id, date_reconnected
    ORDER BY c.zone_id, z.street,z.sa_id, con_day;

    SELECT target_month
        ,sum(IIF(target_type = 'B',target_value,0)) target_bill
        ,sum(IIF(target_type = 'c',target_value,0)) target_collection
    FROM [MUWSADB].[dbo].[light_org_target]
    WHERE target_type IN('B','C')
    GROUP BY target_month
    ORDER BY target_month;

    SELECT concat(year(trans_date),IIF(month(trans_date) < 10,'_0','_'),month(trans_date)) [month]
          ,SUM(IIF(revenue_code_id = '0',debit,0)) bill
          ,SUM(IIF(revenue_code_id = '1' and adjustment <> 1,credit,0)) [collection]
    FROM dbo.transactions
    WHERE trans_date between '${finYearStart}' and '${endDate}' and revenue_code_id IN('0','1')
    GROUP BY concat(year(trans_date),IIF(month(trans_date) < 10,'_0','_'),month(trans_date));

    SELECT target_type
        ,target_value
    FROM [MUWSADB].[dbo].[light_org_target]
    WHERE target_type NOT IN('B','C');
  `;
    // console.log({ sql: queryStm.replace(/[^a-zA-Z0-9 =<>_(),\-\'\.;]/g, " ") });
    let parameterSet =
      dataMode === "sample"
        ? sampleData
        : await db.Initializer.queryDirect(queryStm);
    return res.status(200).json(parameterSet);
  } catch (err) {
    return next(err);
  }
};
