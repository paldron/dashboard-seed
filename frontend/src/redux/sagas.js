import { all } from 'redux-saga/effects';

import orgSagas from './organization/org.sagas';
import dashboardSagas from './dashboard/dashboard.sagas';

export default function* rootSaga(){
    yield all([
        orgSagas(),
        dashboardSagas()
    ])
}