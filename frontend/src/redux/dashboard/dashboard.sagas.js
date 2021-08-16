import { all, call, put, takeLatest } from "redux-saga/effects";
import XLSX from "xlsx";
import { saveAs } from "file-saver";
import { notification } from "antd";

import DashboardActionTypes from "./dashboard.types";
import { apiFetch, s2ab, getRefDate } from "../../services/api";

const {
  LOAD_REVENUE_COLLECTION,
  LOAD_REVENUE_COLLECTION_FAILURE,
  SET_REVENUE_COLLECTION,
  DOWNLOAD_SA_DATA,
  DOWNLOAD_ZONE_DATA,
  DOWNLOAD_SA_READINGS_IN_MONTH,
} = DashboardActionTypes;

function* fetchRevenueCollection() {
  try {
    const payload = yield call(
      apiFetch,
      "GET",
      "/api/dashboard/revenueCollection",
      {}
    );
    if (payload && payload.length > 0)
      yield put({ type: SET_REVENUE_COLLECTION, payload });
  } catch (error) {
    yield put({ type: LOAD_REVENUE_COLLECTION_FAILURE, error });
  }
}

function* loadRevenueCollection() {
  yield takeLatest(LOAD_REVENUE_COLLECTION, fetchRevenueCollection);
}

function* exportZoneData({ payload }) {
  let wb = XLSX.utils.book_new();
  let fileName = `Zone Revenue ${getRefDate().format("YYYY-MM-DD HH:mm:ss")}`;
  wb.Props = {
    Title: fileName,
    Subject: `Zone Revenue Record.`,
    Author: "MUWSA Dashboard",
    CreatedDate: new Date(),
  };
  let msgs = XLSX.utils.json_to_sheet(
    payload.map((p) => {
      return {
        Zone: p.location,
        Customers: p.customer_count,
        Transactions: p.transactions_sales,
        Last_Month_Collection_As_Of_Today: p.collection_projection,
        Current_Collection: p.collection_sales,
        Target_Collection_Previous: p.previous_due,
        Target_Collection_Total: p.collection_sales_target,
        Last_Month_Reading_As_Of_Today: p.proj_readings,
        Current_Reading: p.current_readings,
      };
    })
  );
  XLSX.utils.book_append_sheet(wb, msgs, "Revenue Records");
  let wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "binary",
  });
  saveAs(
    new Blob([s2ab(wbout)], {
      type: "application/octet-stream",
    }),
    fileName + ".xlsx"
  );
  yield 0;
}

function* watchZoneDownloadRequest() {
  yield takeLatest(DOWNLOAD_ZONE_DATA, exportZoneData);
}

function* exportSaData({ payload }) {
  let wb = XLSX.utils.book_new();
  let todayMoment = getRefDate();
  let fileName = `Sales Assistant Revenue ${todayMoment.format(
    "YYYY-MM-DD HH:mm:ss"
  )}`;
  wb.Props = {
    Title: fileName,
    Subject: `Sales Assistant Revenue Record.`,
    Author: "MUWSA Dashboard",
    CreatedDate: new Date(),
  };
  let msgs = XLSX.utils.json_to_sheet(
    payload.map((p) => {
      return {
        SA_Name: p.location,
        Customers: p.customer_count,
        Transactions: p.transactions_sales,
        Last_Month_Collection_As_Of_Today: p.collection_projection,
        Current_Collection: p.collection_sales,
        Target_Collection_Previous: p.previous_due,
        Target_Collection_Total: p.collection_sales_target,
        Last_Month_Reading_As_Of_Today: p.proj_readings,
        Current_Reading: p.current_readings,
      };
    })
  );
  XLSX.utils.book_append_sheet(wb, msgs, "Revenue Records");
  let wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "binary",
  });
  saveAs(
    new Blob([s2ab(wbout)], {
      type: "application/octet-stream",
    }),
    fileName + ".xlsx"
  );
  yield 0;
}

function* watchSaDownloadRequest() {
  yield takeLatest(DOWNLOAD_SA_DATA, exportSaData);
}

function* exportSaReadings() {
  try {
    let wb = XLSX.utils.book_new();
    let todayMoment = getRefDate();
    let fileName = `Sales Assistant Readings ${todayMoment.format(
      "YYYY-MM-DD HH:mm:ss"
    )}`;
    wb.Props = {
      Title: fileName,
      Subject: `Sales Assistant Reading Record.`,
      Author: "MUWSA Dashboard",
      CreatedDate: new Date(),
    };
    notification.open({
      key: "SaReadingsFetchNotification",
      message: "Fetching",
      description: "SA Month Readings",
      duration: 12,
    });
    const payload = yield call(
      apiFetch,
      "GET",
      "/api/dashboard/saReadings",
      {}
    );
    // if (payload.length === 0) {
    //   yield 0;
    //   return;
    // }
    let msgs = XLSX.utils.json_to_sheet(
      payload.map(({ sales_assistant_name, ...other }) => {
        Object.keys(other).forEach((k) => {
          other[k] = other[k] ? other[k] : 0;
        });
        return { _SA: sales_assistant_name, ...other };
      })
    );
    XLSX.utils.book_append_sheet(wb, msgs, "Month Readings");
    let wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "binary",
    });
    saveAs(
      new Blob([s2ab(wbout)], {
        type: "application/octet-stream",
      }),
      fileName + ".xlsx"
    );
    notification.open({
      key: "SaReadingsFetchNotification",
      message: "Download Complete",
      description: "SA Month Readings",
      duration: 3,
    });
    yield 0;
  } catch (error) {
    yield put({ type: LOAD_REVENUE_COLLECTION_FAILURE, error });
  }
}

function* watchSaReadingsDownloadRequest() {
  yield takeLatest(DOWNLOAD_SA_READINGS_IN_MONTH, exportSaReadings);
}

export default function* dashboardSagas() {
  yield all([
    loadRevenueCollection(),
    watchZoneDownloadRequest(),
    watchSaDownloadRequest(),
    watchSaReadingsDownloadRequest(),
  ]);
}
