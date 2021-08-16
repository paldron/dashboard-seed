import { createSelector } from "reselect";
import { getRefDate } from "../../services/api";

const selectOrg = (state) => state.organization;

export const selectKPI = createSelector(selectOrg, (org) => org.kpi);

export const selectLoading = createSelector(selectOrg, (org) => org.loading);

export const selectZones = createSelector(selectOrg, (org) => org.zones);

export const selectCustomers = createSelector(
  selectOrg,
  (org) => org.customers
);

export const selectSalesAssistants = createSelector(
  selectOrg,
  (org) => org.saStaff
);

export const selectSaDayReadings = createSelector(
  selectOrg,
  ({ currentReadings, previousReadings }) => ({
    currentReadings, //: currentReadings.map(reading => ({ ...reading, day: moment(reading.read_day).format('D') })),
    previousReadings, //: previousReadings.map(reading => ({ ...reading, day: moment(reading.read_day).format('D') }))
  })
);

export const selectSaDayConnections = createSelector(
  selectOrg,
  ({
    connections,
    refConnections,
    disconnections,
    refDisconnections,
    reconnections,
    refReconnections,
  }) => ({
    connections,
    refConnections,
    disconnections,
    refDisconnections,
    reconnections,
    refReconnections,
  })
);

export const selectRevenueKPI = createSelector(
  selectOrg,
  ({ target, achievement }) => {
    let today = getRefDate(),
      currentDay = parseInt(today.format("D"), 10),
      currentMonth = parseInt(today.format("MM"), 10),
      currentMonthStr = today.format("YYYY_MM"),
      currentYear = parseInt(today.format("YYYY"), 10),
      lastDay = parseInt(today.endOf("month").format("D")),
      financialYear =
        currentMonth > 6
          ? `${currentYear} - ${currentYear + 1}`
          : `${currentYear - 1} - ${currentYear}`;
    return achievement.reduce(
      (acc, val) => {
        let targetMonth = target.find((m) => m.target_month === val.month);
        if (!targetMonth) return acc;
        acc.bill += val.bill;
        acc.targetCollection +=
          currentMonthStr === val.month
            ? targetMonth.target_collection * (currentDay / lastDay)
            : targetMonth.target_collection;
        if (val.bill !== 0) {
          acc.targetBill += targetMonth.target_bill;
          acc.collection += val.collection;
        }
        return acc;
      },
      {
        bill: 0,
        collection: 0,
        targetBill: 0,
        targetCollection: 0,
        financialYear,
      }
    );
  }
);

export const selectRevenueTargetChart = createSelector(
  selectOrg,
  ({ target, achievement }) => {
    if (!achievement) return [];
    let xArr = ["x"],
      collection = ["Collection"],
      collectionsTarget = ["Collection_Target"],
      bill = ["Bill"],
      billTarget = ["Bill_Target"];
    achievement
      .sort((a, b) => (a.month > b.month ? 1 : a.month < b.month ? -1 : 0))
      .forEach((val) => {
        let targetMonth = target.find((m) => m.target_month === val.month);
        if (!targetMonth) return;
        xArr.push(`${val.month.split("_").join("-")}-01`);
        collection.push(val.collection);
        collectionsTarget.push(targetMonth.target_collection);
        bill.push(val.bill);
        billTarget.push(targetMonth.target_bill);
      });
    return [xArr, billTarget, bill, collectionsTarget, collection];
  }
);

export const selectOtherTargets = createSelector(selectOrg, ({ otherTarget }) =>
  otherTarget.reduce(
    (acc, target) => {
      acc[target.target_type] = target.target_value;
      return acc;
    },
    { N: 0 }
  )
);
