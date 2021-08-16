import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import OrgReducer from './organization/org.reducer';
import DashboardReducer from './dashboard/dashboard.reducer';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: []
}

const rootReducer = combineReducers({
    organization: OrgReducer,
    dashboard: DashboardReducer,
});

export default persistReducer(persistConfig, rootReducer);