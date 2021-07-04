import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { Login } from "./login";

describe("Login component tests", () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it("can render login", () => {
    act(() => {
      ReactDOM.render(<Login />, container);
    });
  });
});
