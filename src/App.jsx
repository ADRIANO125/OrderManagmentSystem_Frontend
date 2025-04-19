import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// تحميل المكونات بشكل كسول (Lazy Loading)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const AddOrderPage = lazy(() => import("./pages/AddOrderPage"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const EditOrderPage = lazy(() => import("./pages/EditOrderPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AddProductPage = lazy(() => import("./pages/AddProductPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const EditProductPage = lazy(() => import("./pages/EditProductPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));

// مكون التحميل
const Loading = () => (
  <div className="flex justify-center items-center h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            }
          />

          {/* Order Routes - More specific routes first */}
          <Route
            path="orders/new"
            element={
              <Suspense fallback={<Loading />}>
                <AddOrderPage />
              </Suspense>
            }
          />
          <Route
            path="orders/edit/:id"
            element={
              <Suspense fallback={<Loading />}>
                <EditOrderPage />
              </Suspense>
            }
          />
          <Route
            path="orders/:id"
            element={
              <Suspense fallback={<Loading />}>
                <OrderDetails />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<Loading />}>
                <OrdersPage />
              </Suspense>
            }
          />

          {/* Product Routes - More specific routes first */}
          <Route
            path="products/new"
            element={
              <Suspense fallback={<Loading />}>
                <AddProductPage />
              </Suspense>
            }
          />
          <Route
            path="products/edit/:id"
            element={
              <Suspense fallback={<Loading />}>
                <EditProductPage />
              </Suspense>
            }
          />
          <Route
            path="products/:id"
            element={
              <Suspense fallback={<Loading />}>
                <ProductDetails />
              </Suspense>
            }
          />
          <Route
            path="products"
            element={
              <Suspense fallback={<Loading />}>
                <ProductsPage />
              </Suspense>
            }
          />

          {/* Statistics Route */}
          <Route
            path="statistics"
            element={
              <Suspense fallback={<Loading />}>
                <StatisticsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
