import OrgActionTypes from './org.types';

const INITIAL_STATE = {
    kpi: {},
    customers: [],
    zones: [],
    saStaff: [],
    currentReadings: [],
    previousReadings: [],
    connections: [],
    refConnections: [],
    disconnections: [],
    refDisconnections: [],
    reconnections: [],
    refReconnections: [],
    target: [],
    achievement: [],
    otherTarget: [],
    loading: true
}

const OrgReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case OrgActionTypes.SET_ORG_PARAMS:
            return {
                ...state,
                customers: action.payload[0],
                zones: action.payload[1],
                saStaff: action.payload[2],
                currentReadings: action.payload[3],
                previousReadings: action.payload[4],
                connections: action.payload[5],
                refConnections: action.payload[6],
                disconnections: action.payload[7],
                refDisconnections: action.payload[8],
                reconnections: action.payload[9],
                refReconnections: action.payload[10],
                target: action.payload[11],
                achievement: action.payload[12],
                otherTarget: action.payload[13],
                loading: false
            }
        default:
            return state;
    }
}

export default OrgReducer;