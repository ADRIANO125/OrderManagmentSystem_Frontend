import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

// إعداد لغة التاريخ والوقت بالعربية
if (Intl.DateTimeFormat) {
  Intl.DateTimeFormat.prototype.formatToParts = function (date) {
    return [];
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
