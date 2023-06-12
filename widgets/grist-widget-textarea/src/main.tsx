import { initializeGristWidget } from "grist-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

export const { useGristRows } = initializeGristWidget({
  columns: {
    text: { type: "Text", title: "Multi-line text", readOnly: true },
  },
  accessAllRecords: false,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
