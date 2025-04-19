import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { orderService, productService } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [orders, products] = await Promise.all([
          orderService.getAllOrders(),
          productService.getAllProducts(),
        ]);

        const pendingOrders = orders.filter(
          (order) => order.status === "Pending"
        );
        const shippedOrders = orders.filter(
          (order) => order.status === "Shipped"
        );
        const deliveredOrders = orders.filter(
          (order) => order.status === "Delivered"
        );

        setStats({
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          shippedOrders: shippedOrders.length,
          deliveredOrders: deliveredOrders.length,
          totalProducts: products.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // تأثيرات الحركة للمكونات
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="text-center mb-10">
        <motion.h1
          className="text-3xl font-bold mb-2 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          مرحباً بك في نظام إدارة الطلبات
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          نظرة عامة على الطلبات والمنتجات
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* إجمالي الطلبات */}
        <motion.div
          variants={item}
          className="card p-6 bg-white shadow-md rounded-lg"
        >
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-secondary mb-4">
              {stats.totalOrders}
            </div>
            <p className="text-gray-600">إجمالي الطلبات</p>
          </div>
        </motion.div>

        {/* الطلبات قيد الانتظار */}
        <motion.div
          variants={item}
          className="card p-6 bg-white shadow-md rounded-lg"
        >
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-yellow-500 mb-4">
              {stats.pendingOrders}
            </div>
            <p className="text-gray-600">الطلبات قيد الانتظار</p>
          </div>
        </motion.div>

        {/* الطلبات المشحونة */}
        <motion.div
          variants={item}
          className="card p-6 bg-white shadow-md rounded-lg"
        >
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-500 mb-4">
              {stats.shippedOrders}
            </div>
            <p className="text-gray-600">الطلبات المشحونة</p>
          </div>
        </motion.div>

        {/* الطلبات المسلمة */}
        <motion.div
          variants={item}
          className="card p-6 bg-white shadow-md rounded-lg"
        >
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-green-500 mb-4">
              {stats.deliveredOrders}
            </div>
            <p className="text-gray-600">الطلبات المسلمة</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* الوصول السريع */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 text-primary">الوصول السريع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/orders/new"
              className="btn btn-primary flex items-center justify-center py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              إضافة طلب جديد
            </Link>
            <Link
              to="/products/new"
              className="btn btn-outline flex items-center justify-center py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              إضافة منتج جديد
            </Link>
            <Link
              to="/orders"
              className="btn btn-outline flex items-center justify-center py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              عرض الطلبات
            </Link>
            <Link
              to="/products"
              className="btn btn-outline flex items-center justify-center py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              عرض المنتجات
            </Link>
          </div>
        </div>

        {/* معلومات المنتجات */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 text-primary">
            معلومات المنتجات
          </h2>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">إجمالي المنتجات</span>
              <span className="text-lg font-bold">{stats.totalProducts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-accent h-2.5 rounded-full"
                style={{ width: `${Math.min(stats.totalProducts * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="text-secondary hover:text-blue-700 underline"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
