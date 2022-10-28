


import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { composeWithDevTools } from "@redux-devtools/extension";
import { createStore, applyMiddleware } from "redux";
import allReducers from "./store/reducers";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./store/rootSaga";
import { createLogger } from "redux-logger";

// logger
var logger = createLogger();

// saga
const sagaMiddleware = createSagaMiddleware();

// middleware
const middleware = [ sagaMiddleware, logger ];

// store
var store = createStore(allReducers, {}, composeWithDevTools(applyMiddleware(...middleware)));

// run saga
sagaMiddleware.run(rootSaga);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);




 