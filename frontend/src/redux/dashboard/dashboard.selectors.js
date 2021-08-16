import { createSelector } from "reselect";
import { getRefDate } from "../../services/api";
import moment from "moment";

import {
  selectCustomers,
  selectZones,
  selectSalesAssistants,
  selectSaDayReadings,
  selectSaDayConnections,
} from "../organization/org.selectors";
import {
  sortRevenueTable,
  extractSaRevenue,
  extractRevenueTableTotal,
  groupToZoneRevenue,
  groupToDayRevenue,
  groupToDayReadings,
  groupToDayConnections,
  extractAllRevenueTotal,
  sortComplaintsTable,
  groupToDayComplaints,
} from "./dashboard.utils";

const selectDashboardMonth = (state) => state.dashboard.revenue;

const selectRevenue = createSelector(
  selectDashboardMonth,
  ({ loading, ...revenue }) => revenue
);

export const selectLoading = createSelector(
  selectDashboardMonth,
  ({ loading }) => loading
);

const selectZoneGroupRevenue = createSelector(
  selectRevenue,
  ({
    allCollections,
    allRefCollections,
    complaints,
    refComplaints,
    collectionRate,
    ...revenue
  }) => groupToZoneRevenue(revenue)
);

export const selectCollectionRate = createSelector(
  selectRevenue,
  ({ collectionRate }) =>
    collectionRate[0] ? collectionRate[0].collection_rate : 0
);

export const selectDayGroupRevenue = createSelector(
  selectRevenue,
  ({
    allCollections,
    allRefCollections,
    complaints,
    refComplaints,
    collectionRate,
    ...revenue
  }) => groupToDayRevenue(revenue)
);

export const selectDayGroupRevenueAll = createSelector(
  selectRevenue,
  ({ allCollections, allRefCollections }) =>
    groupToDayRevenue({ allCollections, allRefCollections })
);

export const selectDayGroupComplaints = createSelector(
  selectRevenue,
  ({ complaints, refComplaints }) =>
    groupToDayComplaints({ complaints, refComplaints })
);

export const selectAllRevenueTotal = createSelector(
  selectRevenue,
  ({ allCollections, allRefCollections }) =>
    extractAllRevenueTotal({
      revenueTotal: [...allCollections, ...allRefCollections],
    })
);

export const selectAllRevenueTodayTotal = createSelector(
  selectRevenue,
  ({ allCollections }) => {
    const today = getRefDate().format("D");
    let retVal = allCollections.reduce((acc, collection) => {
      if (moment(collection.trans_date).format("D") === today)
        return (acc += collection.collections);
      return acc;
    }, 0);
    return retVal;
  }
);

export const selectComplaintsTable = createSelector(
  selectRevenue,
  ({ complaints, refComplaints }) =>
    sortComplaintsTable([...complaints, ...refComplaints])
);

export const selectReducedRevenueTotal = createSelector(
  selectAllRevenueTotal,
  ({ revenueTotal }) => {
    return revenueTotal.reduce((acc, data) => {
      Object.keys(data).map((key) => {
        if (key === "revenue") return key;
        if (acc[key]) {
          acc[key] += data[key];
        } else {
          acc[key] = data[key];
        }
        return key;
      });
      return acc;
    }, {});
  }
);

export const selectDayGroupReadings = createSelector(
  selectSaDayReadings,
  (readings) => groupToDayReadings(readings)
);

export const selectDayGroupConnections = createSelector(
  selectSaDayConnections,
  (connections) => groupToDayConnections(connections)
);

export const selectRevenueTable = createSelector(
  selectZoneGroupRevenue,
  selectCustomers,
  selectZones,
  (revenue, customers, zones) => sortRevenueTable(revenue, customers, zones)
);

export const selectSaRevenueTable = createSelector(
  selectRevenueTable,
  selectSalesAssistants,
  (data, sa) => extractSaRevenue(data, sa)
);

export const selectRevenueTableTotal = createSelector(
  selectRevenueTable,
  (data) => extractRevenueTableTotal(data)
);

export const selectCollectionSalesTarget = createSelector(
  selectRevenueTableTotal,
  (revenue) => revenue.collection_sales_target
);

export const selectSalesCollectionChart = createSelector(
  selectDayGroupRevenue,
  ({ billCollection, refCollection }) => {
    if (!billCollection) return [];
    const lastDay = parseInt(getRefDate().endOf("month").format("D"), 10);
    let xArr = ["x"],
      collections = ["Collections"],
      projections = [
        getRefDate().startOf("month").subtract(1, "days").format("MMMM"),
      ];
    // target = ["Target"],
    // targetCollection = collection_sales_target / lastDay;
    for (let i = 1; i <= lastDay; i++) {
      let key = i < 10 ? `0${i}` : `${i}`;
      xArr.push(key);
      //target.push(targetCollection);
      const billCol = billCollection.find((col) => col.day === key);
      if (billCol) {
        collections.push(billCol.collections);
        const refCol = refCollection.find((col) => col.day === key);
        if (refCol) projections.push(refCol.collections);
      }
    }
    return [xArr, collections, projections];
  }
);

export const selectSalesCollectionChartAll = createSelector(
  selectDayGroupRevenueAll,
  ({ allCollections, allRefCollections }) => {
    if (!allCollections) return [];
    //console.log({ allCollections, allRefCollections });
    const lastDay = parseInt(getRefDate().endOf("month").format("D"), 10);
    let xArr = ["x"],
      collections = ["Collections"],
      projections = [
        getRefDate().startOf("month").subtract(1, "days").format("MMMM"),
      ];
    // target = ["Target"],
    // targetCollection = collection_sales_target / lastDay;
    for (let i = 1; i <= lastDay; i++) {
      let key = i < 10 ? `0${i}` : `${i}`;
      xArr.push(key);
      //target.push(targetCollection);

      const refCol = allRefCollections.find((col) => col.day === key);
      if (refCol) {
        projections.push(refCol.ref_collections);
        const billCol = allCollections.find((col) => col.day === key);
        if (billCol) {
          collections.push(billCol.collections);
        }
      }
    }
    return [xArr, collections, projections];
  }
);

export const selectNewConnectionChart = createSelector(
  selectDayGroupRevenue,
  ({ newConnection, connRefCollection }) => {
    //console.log("New conn selector",newConnection, connRefCollection)
    if (!newConnection) return [];
    const lastDay = parseInt(getRefDate().format("D"), 10);
    let xArr = ["x"],
      collectionsWater = ["Water"],
      projectionsWater = [
        getRefDate().startOf("month").subtract(1, "days").format("MMM") +
          "_Water",
      ],
      collectionsSewer = ["Sewer"],
      projectionsSewer = [
        getRefDate().startOf("month").subtract(1, "days").format("MMM") +
          "_Sewer",
      ];
    // target = ["Target"],
    // targetCollection = collection_sales_target / lastDay;
    for (let i = 1; i <= lastDay; i++) {
      let key = i < 10 ? `0${i}` : `${i}`;
      xArr.push(key);
      //target.push(targetCollection);
      const refCol = connRefCollection.find((col) => col.day === key);
      if (refCol) {
        projectionsWater.push(refCol.con_water);
        projectionsSewer.push(refCol.con_sewer);
      } else {
        projectionsWater.push(0);
        projectionsSewer.push(0);
      }
      const newCol = newConnection.find((col) => col.day === key);
      if (newCol) {
        collectionsWater.push(newCol.water);
        collectionsSewer.push(newCol.sewer);
      } else {
        collectionsWater.push(0);
        collectionsSewer.push(0);
      }
    }
    return [
      xArr,
      collectionsWater,
      projectionsWater,
      collectionsSewer,
      projectionsSewer,
    ];
  }
);

export const selectReadingsChart = createSelector(
  selectDayGroupReadings,
  ({ currentReadings, previousReadings }) => {
    if (!previousReadings && !currentReadings) return [];
    const lastDay = parseInt(getRefDate().format("D"), 10);
    let xArr = ["x"],
      readings = ["Meter_Read"],
      projectionReadings = [
        getRefDate().startOf("month").subtract(1, "days").format("MMM") +
          "_Reads",
      ],
      consumption = ["Consumption"],
      projectionsCons = [
        getRefDate().startOf("month").subtract(1, "days").format("MMM") +
          "_Consumption",
      ];
    for (let i = 1; i <= lastDay; i++) {
      let key = i < 10 ? `0${i}` : `${i}`;
      xArr.push(key);
      //target.push(targetCollection);
      const refReads = previousReadings.find((col) => col.day === key);
      if (refReads) {
        projectionsCons.push(refReads.consumption);
        projectionReadings.push(refReads.readings);
      } else {
        projectionsCons.push(0);
        projectionReadings.push(0);
      }
      const reads = currentReadings.find((col) => col.day === key);
      if (reads) {
        readings.push(reads.readings);
        consumption.push(reads.consumption);
      } else {
        readings.push(0);
        consumption.push(0);
      }
    }
    return [xArr, readings, projectionReadings, consumption, projectionsCons];
  }
);

export const selectConnectionsChart = createSelector(
  selectDayGroupConnections,
  ({
    connections,
    refConnections,
    disconnections,
    refDisconnections,
    reconnections,
    refReconnections,
  }) => {
    if (
      !connections &&
      !refConnections &&
      !disconnections &&
      !refDisconnections &&
      !reconnections &&
      !refReconnections
    )
      return [];
    const lastDay = parseInt(getRefDate().format("D"), 10);
    let xArr = ["x"],
      monthName = getRefDate()
        .startOf("month")
        .subtract(1, "days")
        .format("MMM"),
      saConnections = ["Connection"],
      projectionSaConnections = [monthName + "_Con"],
      saDisconnections = ["Disconnection"],
      projectionSaDisconnections = [monthName + "_Disc"],
      saReconnections = ["Reconnection"],
      projectionSaReconnections = [monthName + "_Rec"];
    for (let i = 1; i <= lastDay; i++) {
      let key = i < 10 ? `0${i}` : `${i}`;
      xArr.push(key);
      //target.push(targetCollection);
      const refConnection = refConnections.find((col) => col.day === key);
      if (refConnection) {
        projectionSaConnections.push(refConnection.customers);
      } else {
        projectionSaConnections.push(0);
      }
      const saConnectionsAc = connections.find((col) => col.day === key);
      if (saConnectionsAc) {
        saConnections.push(saConnectionsAc.customers);
      } else {
        saConnections.push(0);
      }

      const refDisconnection = refDisconnections.find((col) => col.day === key);
      if (refDisconnection) {
        projectionSaDisconnections.push(refDisconnection.customers);
      } else {
        projectionSaDisconnections.push(0);
      }
      const saDisconnectionsAc = disconnections.find((col) => col.day === key);
      if (saDisconnectionsAc) {
        saDisconnections.push(saDisconnectionsAc.customers);
      } else {
        saDisconnections.push(0);
      }

      const refReconnection = refReconnections.find((col) => col.day === key);
      if (refReconnection) {
        projectionSaReconnections.push(refReconnection.customers);
      } else {
        projectionSaReconnections.push(0);
      }
      const saReconnectionsAc = reconnections.find((col) => col.day === key);
      if (saReconnectionsAc) {
        saReconnections.push(saReconnectionsAc.customers);
      } else {
        saReconnections.push(0);
      }
    }
    return [
      xArr,
      saConnections,
      projectionSaConnections,
      saDisconnections,
      projectionSaDisconnections,
      saReconnections,
      projectionSaReconnections,
    ];
  }
);

export const selectComplaintChart = createSelector(
  selectDayGroupComplaints,
  ({ complaints, refComplaints }) => {
    if (!complaints && !refComplaints) return [];
    const lastDay = parseInt(getRefDate().format("D"), 10);
    let xArr = ["x"],
      monthName = getRefDate()
        .startOf("month")
        .subtract(1, "days")
        .format("MMM"),
      unattended = ["Unattended"],
      //projectionUnattended = [ monthName + "_Unattended"],
      inProgress = ["In_Progress"],
      //projectionInProgress = [ monthName + "_In_Progress"],
      resolved = ["Resolved"],
      //projectionResolved = [ monthName + "_Resolved"],
      unResolved = [monthName + "_Unresolved"];
    // target = ["Target"],
    // targetCollection = collection_sales_target / lastDay;
    for (let i = 1; i <= lastDay; i++) {
      let key = i < 10 ? `0${i}` : `${i}`;
      xArr.push(key);
      //target.push(targetCollection);
      const unattendedComp = complaints.find((col) => col.day === key);
      if (unattendedComp) {
        unattended.push(unattendedComp.unattended);
        inProgress.push(unattendedComp.in_progress);
        resolved.push(unattendedComp.resolved);
      } else {
        unattended.push(0);
        inProgress.push(0);
        resolved.push(0);
      }

      const refUnattendedComp = refComplaints.find((col) => col.day === key);
      if (refUnattendedComp) {
        unResolved.push(
          refUnattendedComp.ref_unattended + refUnattendedComp.ref_in_progress
        );
        // projectionInProgress.push(refUnattendedComp.ref_in_progress);
        // projectionResolved.push(refUnattendedComp.ref_resolved);
      } else {
        unResolved.push(0);
        // projectionInProgress.push(0);
        // projectionResolved.push(0);
      }
    }
    return [xArr, unattended, inProgress, resolved, unResolved];
  }
);

export const selectComplaintDonut = createSelector(
  selectComplaintChart,
  selectComplaintsTable,
  ([x, ...chart], table) => {
    const complaintKeys = ["ref_resolved", "in_progress", "resolved"];
    let retVal = { state: [], types: [] };
    if (!x) return retVal;
    chart.forEach(([key, ...data]) => {
      retVal.state.push([key, data.reduce((acc, val) => acc + val)]);
    });

    table.forEach(({ complaint, ...data }) => {
      let val = [
        complaint,
        complaintKeys.reduce((acc, key) => acc + data[key], 0),
      ];
      if (val[1] !== 0) {
        retVal.types.push(val);
      }
    });

    return retVal;
  }
);
