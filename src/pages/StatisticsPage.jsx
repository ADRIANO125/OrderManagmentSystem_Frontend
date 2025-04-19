import React, { useState, useEffect } from "react";
import { orderService, productService } from "../services/api";
import {
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/formatters";
import { motion } from "framer-motion";

const StatisticsPage = () => {
  // States
  const [orderStats, setOrderStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("week"); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch order statistics
        const orders = await orderService.getAllOrders();

        // Calculate order statistics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        );
        const pendingOrders = orders.filter(
          (order) => order.status === "pending"
        ).length;
        const completedOrders = orders.filter(
          (order) => order.status === "completed"
        ).length;

        // Set order statistics
        setOrderStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        });

        // Fetch products
        const products = await productService.getAllProducts();

        // Calculate product statistics
        const totalProducts = products.length;

        // Set product statistics
        setProductStats({
          totalProducts,
        });

        // Calculate top selling products
        const productMap = new Map();
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const currentTotal = productMap.get(item.productId) || {
              units: 0,
              revenue: 0,
              name: item.productName,
            };
            productMap.set(item.productId, {
              units: currentTotal.units + item.quantity,
              revenue: currentTotal.revenue + item.price * item.quantity,
              name: item.productName,
            });
          });
        });

        const topProductsArray = Array.from(productMap.entries())
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(topProductsArray);

        // Get recent orders
        const sortedOrders = [...orders]
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 5);

        setRecentOrders(sortedOrders);
      } catch (err) {
        setError("Failed to load statistics");
        console.error("Error fetching statistics:", err);
        toast.error("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const filterDataByTimeFrame = (timeFrame) => {
    setTimeFrame(timeFrame);
    // In a real application, you would refetch data based on the selected time frame
    toast.info(`Displaying statistics for the last ${timeFrame}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Statistics & Analytics
        </h1>

        <div className="flex space-x-2">
          <button
            onClick={() => filterDataByTimeFrame("week")}
            className={`px-4 py-2 rounded ${
              timeFrame === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => filterDataByTimeFrame("month")}
            className={`px-4 py-2 rounded ${
              timeFrame === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => filterDataByTimeFrame("year")}
            className={`px-4 py-2 rounded ${
              timeFrame === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Orders
            </h2>
            <FaShoppingCart className="text-blue-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {orderStats?.totalOrders || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Orders placed in the system
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Revenue
            </h2>
            <FaChartLine className="text-green-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(orderStats?.totalRevenue || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total sales revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Average Order
            </h2>
            <FaShoppingCart className="text-purple-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {formatCurrency(orderStats?.averageOrderValue || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Average order value</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Pending Orders
            </h2>
            <FaCalendarAlt className="text-yellow-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {orderStats?.pendingOrders || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Orders waiting to be processed
          </p>
        </motion.div>
      </div>

      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Products
            </h2>
            <FaBoxes className="text-indigo-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            {productStats?.totalProducts || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Products in your catalog</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top Selling Products
          </h2>

          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {product.units}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">
              No product sales data available
            </p>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Orders
          </h2>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">
              No recent orders available
            </p>
          )}
        </motion.div>
      </div>

      {/* Revenue Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Revenue Over Time
        </h2>
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded">
          <p className="text-gray-500 italic">
            Chart visualization would appear here. In a real application, this
            would be implemented with a charting library like Chart.js or
            Recharts.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StatisticsPage;
