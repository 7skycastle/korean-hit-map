import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { installStaticApi } from "./mock/staticApi";
import "./styles.css";

installStaticApi();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={window.location.hostname.endsWith("github.io") ? "/korean-hit-map" : undefined}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
