import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { orderService } from "../services/api";
import { formatDate } from "../utils/formatters";
import DeleteConfirmation from "../components/DeleteConfirmation";
import Spinner from "../components/Spinner";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getOrderById(id);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          "حدث خطأ أثناء جلب بيانات الطلب. يرجى المحاولة مرة أخرى لاحقًا."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/orders/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await orderService.deleteOrder(id);
      navigate("/orders", {
        state: {
          notification: {
            type: "success",
            message: "تم حذف الطلب بنجاح",
          },
        },
      });
    } catch (err) {
      setError("حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى لاحقًا.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "جديد":
        return "bg-blue-100 text-blue-800";
      case "جاري التحضير":
        return "bg-yellow-100 text-yellow-800";
      case "جاهز للتسليم":
        return "bg-green-100 text-green-800";
      case "تم التسليم":
        return "bg-purple-100 text-purple-800";
      case "ملغي":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">تنبيه! </strong>
          <span className="block sm:inline">
            لم يتم العثور على بيانات لهذا الطلب.
          </span>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
          <h1 className="text-2xl font-bold text-gray-800">
            تفاصيل الطلب #{order.orderNumber || id}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                معلومات العميل
              </h2>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium">{order.customerName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium">{order.phone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">العنوان:</span>
                  <span className="font-medium">{order.address}</span>
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                معلومات الطلب
              </h2>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">تاريخ الطلب:</span>
                  <span className="font-medium">
                    {formatDate(order.orderDate)}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">المنتج:</span>
                  <span className="font-medium">{order.product}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">السعر:</span>
                  <span className="font-medium">{order.price} جنيه</span>
                </p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                ملاحظات
              </h2>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-4 rtl:space-x-reverse">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/orders")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              العودة للقائمة
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              تعديل الطلب
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteConfirmation(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              حذف الطلب
            </motion.button>
          </div>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
        title="تأكيد حذف الطلب"
        message="هل أنت متأكد من أنك ترغب في حذف هذا الطلب؟ لا يمكن التراجع عن هذه العملية."
      />
    </motion.div>
  );
};

export default OrderDetailsPage;
