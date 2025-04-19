import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { orderService } from "../services/api";
import { FaEye, FaEdit, FaTrash, FaTimes, FaBoxes } from "react-icons/fa";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getAllOrders();
        console.log("Orders data:", data); // للتحقق من البيانات
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async (id) => {
    try {
      await orderService.deleteOrder(id);
      setOrders(orders.filter((order) => order._id !== id));
      toast.success("تم حذف الطلب بنجاح");
      setShowConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("حدث خطأ أثناء حذف الطلب");
    }
  };

  // الحصول على أول منتج في الطلب (للعرض في الجدول)
  const getFirstProduct = (order) => {
    if (order.items && order.items.length > 0) {
      // استخدام اسم المنتج بدلاً من ID إذا كان متوفراً
      return order.items[0].productName || order.items[0].product || "غير محدد";
    }
    return "غير محدد";
  };

  // عدد المنتجات في الطلب
  const getProductCount = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.length;
    }
    return 0;
  };

  const filteredOrders = orders.filter((order) => {
    // البحث في اسم العميل ورقم الهاتف
    const customerMatch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobileNum?.includes(searchTerm);

    // البحث في أسماء المنتجات
    const productMatch =
      order.items &&
      order.items.some((item) =>
        item.product?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // تطبيق فلتر الحالة
    const statusMatch = statusFilter === "all" || order.status === statusFilter;

    return (customerMatch || productMatch) && statusMatch;
  });

  // تأثيرات الحركة
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <motion.h1
          className="text-3xl font-bold text-indigo-700 mb-4 md:mb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          الطلبات
        </motion.h1>
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/orders/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            إضافة طلب جديد
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="sr-only">
              بحث
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="w-full p-2 pl-10 pr-4 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ابحث عن اسم العميل، المنتج، رقم الجوال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="Pending">قيد الانتظار</option>
              <option value="Shipped">تم الشحن</option>
              <option value="Delivered">تم التسليم</option>
            </select>
          </div>
        </div>
      </motion.div>

      {filteredOrders.length === 0 ? (
        <motion.div
          className="text-center py-10 bg-white shadow-md rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            لا توجد طلبات
          </h3>
          <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة طلب جديد.</p>
          <div className="mt-6">
            <Link
              to="/orders/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              إضافة طلب جديد
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-100"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتجات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر الإجمالي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <motion.tr key={order._id} variants={item}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-gray-500 text-sm" dir="ltr">
                        {order.mobileNum}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 ml-2">
                        {getFirstProduct(order)}
                      </span>
                      {getProductCount(order) > 1 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                          <FaBoxes className="mr-1" size={12} />+
                          {getProductCount(order) - 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.totalPrice} ج.م
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status === "Pending"
                        ? "قيد الانتظار"
                        : order.status === "Shipped"
                        ? "تم الشحن"
                        : "تم التسليم"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                      {showConfirmDelete === order._id ? (
                        <>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                            title="تأكيد الحذف"
                          >
                            <FaTrash size={16} />
                          </button>
                          <button
                            onClick={() => setShowConfirmDelete(null)}
                            className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                            title="إلغاء"
                          >
                            <FaTimes size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to={`/orders/${order._id}`}
                            className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <FaEye size={16} />
                          </Link>
                          <Link
                            to={`/orders/edit/${order._id}`}
                            className="bg-indigo-100 text-indigo-600 p-2 rounded-full hover:bg-indigo-200 transition-colors"
                            title="تعديل"
                          >
                            <FaEdit size={16} />
                          </Link>
                          <button
                            onClick={() => setShowConfirmDelete(order._id)}
                            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <FaTrash size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default OrdersPage;
