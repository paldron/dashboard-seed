import { notification } from 'antd';
import DashboardActionTypes from './dashboard.types';

const INITIAL_STATE = {
    revenue: {
        loading: true,
        newConnection: [],
        billCollection: [],
        allCollections: [],
        refCollection: [],
        reconCollection: [],
        connRefCollection: [],
        allRefCollections: [],
        complaints: [],
        refComplaints: [],
        collectionRate: []
    }
}

const key = 'userNotificationUI';
const key_2 = 'userNotificationUI_2';

const openNotification = (message, description, type, duration = 12) => {
    if (type) {
        notification[type]({
            key: key_2,
            message,
            description,
            duration,
            placement: "bottomRight"
        });
    } else {
        notification.open({
            key,
            message,
            description,
            duration: 12,
            placement: "bottomRight"
        });
    }
}

const DashboardReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case DashboardActionTypes.LOAD_REVENUE_COLLECTION:
            return {
                ...state,
                revenue: {
                    ...state.revenue
                }
            }
        case DashboardActionTypes.LOAD_REVENUE_COLLECTION_FAILURE:
            openNotification(
                "Fetch Error",
                (action.error.message)? action.error.message : 'Network Error',
                'error');
            return state;
        case DashboardActionTypes.SET_REVENUE_COLLECTION:
            if (state.revenue.loading) {
                openNotification(
                    "Welcome",
                    "Please Hover on '%' to see values they represent.");
                openNotification(
                    "Note",
                    "The percents indicators compare last month and current month's date data.","info");
            }
            return {
                ...state,
                revenue: {
                    loading: false,
                    billCollection: action.payload[0],
                    newConnection: action.payload[1],
                    allCollections: action.payload[2],
                    refCollection: action.payload[3],
                    reconCollection: action.payload[4],
                    connRefCollection: action.payload[5],
                    allRefCollections: action.payload[6],
                    complaints: action.payload[7],
                    refComplaints: action.payload[8],
                    collectionRate: action.payload[9]
                }
            }
        default:
            return state;
    }
}

export default DashboardReducer;