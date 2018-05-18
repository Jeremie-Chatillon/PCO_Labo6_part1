import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Rx from "rxjs";
import "rxjs/add/observable/concat";
import "rxjs/add/observable/of";
import "rxjs/add/operator/scan";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { InputPage } from "input-page";
import { WebSocketFileServerService } from "./services/fileserver";
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";

// Import semantic UI CSS
const styles = require("semantic-ui-css/semantic.min.css");

// Type definition for redux actions
interface Action<T> {
  type: string;
  payload: T;
}

// Type definition for application state
interface State {
  inputPath: string;
  loading: boolean;
  error: string;
  connected: boolean;
  content: string;
  address: string;
  requestsCount: number;
}

// Create our stream: rx subjects allow for both pushing data into the stream and subscribing
const action$ = new Subject<Action<any>>();

// Initial State
const initialState: State = {
  inputPath: "",
  loading: false,
  error: "",
  connected: false,
  content: "",
  address: "",
  requestsCount: 1
};

// Redux reducer
function reducer(prevState: State, action: Action<any>): State {
  console.log(`reducing action ${action.type}`);
  switch (action.type) {
    case "SET_PATH":
      return { ...prevState, inputPath: action.payload };
    case "LOAD_FILE":
      return { ...prevState, loading: true };
    case "RESET_PATH":
      return { ...prevState, loading: false, content: "", inputPath: ""};
    case "CONNECTION_STATUS":
      return { ...prevState, connected: action.payload };
    case "FILE_LOADED":
      return { ...prevState, content: action.payload, loading: false };
    case "ERROR":
      return { ...prevState, error: action.payload };
    case "SET_ADDRESS":
      return { ...prevState, address: action.payload };
    case "SET_REQUESTS_COUNT":
      return { ...prevState, requestsCount: action.payload };
    default:
      return prevState;
  }
}

// Reduxification
const store$ = Observable.concat(
  Observable.of(initialState),
  action$.scan(reducer, initialState));

// File server
const addressEpic = action$
  .filter(action => action.type === "SET_ADDRESS")
  .debounceTime(200)
  .map(action => action.payload);
const fileServer = new WebSocketFileServerService(addressEpic);

const connectionStatusEpic = fileServer.getConnectionStatus$().subscribe(
  (status: boolean) => dispatchAction({
    type: "CONNECTION_STATUS",
    payload: status
  }));

const filePathEpic = action$
  .filter(action => action.type === "SET_PATH")
  .debounceTime(200)
  .map<Action<string>, Action<string>>(action => { 
      if (action.payload === "") {
        return {
          type: "RESET_PATH",
          payload: ""
        };
      } else {
        return {
          type: "LOAD_FILE",
          payload: action.payload
        };
      }}).subscribe(action$);

const loadFileEpic = action$.zip(store$)
    .filter(([action, state]) => 
      action.type === "LOAD_FILE" 
      || action.type === "SET_ADDRESS" 
      || action.type === "SET_REQUESTS_COUNT")
    .filter(([action, state]) => state.inputPath !== "")
    .distinctUntilChanged()
    .switchMap(([action, state]) => fileServer.getFile(state.inputPath, state.requestsCount))
    .map(file =>  {
      return  {
        type: "FILE_LOADED",
        payload: file.data
      };
    }).subscribe(action$);    
   

// Higher order function to send actions to the stream
function dispatchAction(action: Action<any>) {
  console.log(`dispatching action ${action.type}`);
  action$.next(action);
}

// Example action function
function loadFile(filePath: string) {
  dispatchAction({
    type: "LOAD_FILE",
    payload: filePath
  });
}
function setPath(filePath: string) {
  dispatchAction({
    type: "SET_PATH",
    payload: filePath
  });
}
function changeAddress(address: string) {
  dispatchAction({
    type: "SET_ADDRESS",
    payload: address
  });
}
function changeRequestsCount(count: number) {
  dispatchAction({
    type: "SET_REQUESTS_COUNT",
    payload: count
  });
}

// React App component 
function App(state: State): React.ReactElement<any> {
  return (  // JSX elements produce React "elements" - they are syntactic sugar for React.createElement()
    <div>
      <InputPage
        input={state.inputPath}
        error={state.error}
        loading={state.loading}
        hasContent={state.content != null}
        content={state.content}
        address={state.address}
        isConnected={state.connected}
        inputChanged={(input) => setPath(input)}
        addressChanged={(input) => changeAddress(input)}
        requestsCountChanged={(input) => changeRequestsCount(input)}
        requestsCount={state.requestsCount} />
    </div>
  );
}

// Subscribe and render the view
store$.subscribe((state: State) => {
  console.log(`rendering app`);
  ReactDOM.render(<App {...state} />, document.getElementById("app"));
});

// Launch connection to default address
const socket = new WebSocketSubject("ws://badurlhere");

changeAddress("ws://localhost:1234");