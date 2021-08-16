import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { persistStore } from 'redux-persist';
//import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import RootReducer from './root-reducer';
import mySagas from './sagas';

const sagaMiddleware = createSagaMiddleware();

const middleware = [sagaMiddleware];

if(process.env.NODE_ENV === 'DEVELOPMENT'.toLocaleLowerCase()){
    middleware.push(logger);
}

const store = createStore(RootReducer, applyMiddleware(...middleware));

sagaMiddleware.run(mySagas);

export const persistor = persistStore(store);

export default store;