import React from "react";
import ReactDOM from "react-dom";
import { Login } from "./login/login";

ReactDOM.render(
  <div className="wrapper">
    <h1>Welcome to the best app ever!</h1>
    <h2>Please login</h2>
    <Login />
  </div>,
  document.querySelector("#root")
);
