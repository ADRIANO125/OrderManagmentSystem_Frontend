import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// إزالة console.log في بيئة الإنتاج لتحسين الأداء والأمان
if (process.env.NODE_ENV === "production") {
  // تعطيل console.log و console.warn في بيئة الإنتاج
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.info = noop;

  // إبقاء console.error للأخطاء المهمة
  const originalError = console.error;
  console.error = (...args) => {
    // يمكنك هنا إرسال الأخطاء إلى خدمة تتبع الأخطاء مثل Sentry
    originalError(...args);
  };
}

// تعريف CSP في الرأس (يجب أيضًا تعريفه في الخادم)
if (typeof document !== "undefined") {
  // منع XSS و injection attacks
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content =
    "default-src 'self'; img-src 'self' data: https: http:; style-src 'self' https://cdn.tailwindcss.com 'unsafe-inline'; script-src 'self'";
  document.head.appendChild(meta);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
