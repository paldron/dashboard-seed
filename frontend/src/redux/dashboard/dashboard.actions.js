import DashboardActionTypes from './dashboard.types';

export const loadRevenueCollection = () => ({
    type: DashboardActionTypes.LOAD_REVENUE_COLLECTION
});

export const downloadSaData = (payload) => ({
    type: DashboardActionTypes.DOWNLOAD_SA_DATA,
    payload
});

export const downloadZoneData = (payload) => ({
    type: DashboardActionTypes.DOWNLOAD_ZONE_DATA,
    payload
});

export const downloadSaMonthReadings = () => ({
    type: DashboardActionTypes.DOWNLOAD_SA_READINGS_IN_MONTH,
});