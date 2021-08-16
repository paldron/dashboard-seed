import { all, take, call, put, fork } from 'redux-saga/effects';

import OrgActionTypes from './org.types';
import { apiFetch } from './../../services/api';

const {
    INIT_ORG_PARAMS, 
    INIT_ORG_PARAMS_FAILURE,
    SET_ORG_PARAMS
 } = OrgActionTypes;

function* fetchOrganizationState() {
    try {
        const payload = yield call(apiFetch, "GET", "/api/initializer/commondata", {});
        if(payload && payload.length  > 0)
            yield put({type: SET_ORG_PARAMS, payload })
    } catch (error) {
        yield put({ type: INIT_ORG_PARAMS_FAILURE, error})
    }
}

function* loadOrganizationState() {
    while (true) {
        yield take(INIT_ORG_PARAMS);
        yield fork(fetchOrganizationState)
    }
}

export default function* orgSagas() {
    yield all([
        loadOrganizationState()
    ])
}