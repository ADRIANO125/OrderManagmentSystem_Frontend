import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { orderService, productService } from "../services/api";

// مخطط التحقق من صحة البيانات
const validationSchema = yup.object().shape({
  customerName: yup
    .string()
    .required("اسم العميل مطلوب")
    .min(2, "يجب أن يحتوي اسم العميل على حرفين على الأقل"),
  mobileNum: yup
    .string()
    .required("رقم الهاتف مطلوب")
    .matches(/^01[0-9]{9}$/, "يجب أن يتكون رقم الهاتف من 11 رقم ويبدأ بـ 01"),
  address: yup
    .string()
    .required("عنوان العميل مطلوب")
    .min(3, "يجب أن يحتوي العنوان على 3 أحرف على الأقل"),
  notes: yup.string().nullable(),
  status: yup
    .string()
    .required("حالة الطلب مطلوبة")
    .oneOf(["Pending", "Shipped", "Delivered"], "حالة الطلب غير صالحة"),
  orderStatus: yup
    .string()
    .required("حالة التسليم مطلوبة")
    .oneOf(["Delivery", "Returned", "Exchange"], "حالة التسليم غير صالحة"),
});

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [productValidationError, setProductValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      customerName: "",
      mobileNum: "",
      address: "",
      notes: "",
      status: "Pending",
      orderStatus: "Delivery",
    },
  });

  // جلب المنتجات والطلب عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // جلب بيانات المنتجات والطلب بالتوازي
        const [orderData, productsData] = await Promise.all([
          orderService.getOrderById(id),
          productService.getAllProducts(),
        ]);

        setProducts(productsData);

        // إعداد معلومات الطلب
        reset({
          customerName: orderData.customerName || "",
          mobileNum: orderData.mobileNum || "",
          address: orderData.address || "",
          notes: orderData.notes || "",
          status: orderData.status || "Pending",
          orderStatus: orderData.orderStatus || "Delivery",
        });

        // إعداد العناصر
        if (orderData.items && orderData.items.length > 0) {
          const formattedItems = orderData.items.map((item) => {
            // البحث عن المنتج في قائمة المنتجات
            const product = productsData.find((p) => p._id === item.product);
            return {
              product: item.product,
              productName: product ? product.productName : item.productName,
              quantity: item.quantity || 1,
              price: item.price || 0,
            };
          });
          setOrderItems(formattedItems);
          calculateTotal(formattedItems);
        } else {
          setOrderItems([
            { product: "", productName: "", quantity: 1, price: 0 },
          ]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.");
        toast.error("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  // إضافة منتج جديد للطلب
  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { product: "", productName: "", quantity: 1, price: 0 },
    ]);
    setProductValidationError("");
  };

  // حذف منتج من الطلب
  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
      calculateTotal(newItems);
      setProductValidationError("");
    } else {
      toast.warn("يجب أن يحتوي الطلب على منتج واحد على الأقل");
    }
  };

  // تحديث بيانات المنتج
  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];

    if (field === "product") {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct) {
        // تحديث كامل لبيانات المنتج مع الحفاظ على الكمية الحالية
        const currentQuantity = newItems[index].quantity || 1;
        newItems[index] = {
          product: selectedProduct._id,
          productName: selectedProduct.productName,
          price: selectedProduct.price || 0,
          quantity: currentQuantity,
        };
      } else {
        // إعادة تعيين البيانات إذا لم يتم العثور على المنتج
        newItems[index] = {
          product: "",
          productName: "",
          price: 0,
          quantity: 1,
        };
      }
    } else if (field === "quantity") {
      // تحديث الكمية مع الحفاظ على بقية البيانات
      newItems[index] = {
        ...newItems[index],
        quantity: parseInt(value) || 1,
      };
    } else if (field === "price") {
      // تحديث السعر مع الحفاظ على بقية البيانات
      newItems[index] = {
        ...newItems[index],
        price: parseFloat(value) || 0,
      };
    }

    setOrderItems(newItems);
    calculateTotal(newItems);
    setProductValidationError("");
  };

  // حساب السعر الإجمالي
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + item.quantity * (item.price || 0);
    }, 0);
    setTotalPrice(total);
    return total;
  };

  // التحقق من صحة المنتجات
  const validateProducts = () => {
    if (orderItems.length === 0) {
      setProductValidationError("يجب إضافة منتج واحد على الأقل للطلب");
      return false;
    }

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.product) {
        setProductValidationError(`يرجى اختيار المنتج في العنصر ${i + 1}`);
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        setProductValidationError(
          `الكمية في العنصر ${i + 1} يجب أن تكون 1 على الأقل`
        );
        return false;
      }
      if (!item.price || item.price <= 0) {
        setProductValidationError(
          `السعر في العنصر ${i + 1} يجب أن يكون أكبر من 0`
        );
        return false;
      }
    }

    setProductValidationError("");
    return true;
  };

  // معالجة تقديم النموذج
  const onSubmit = async (data) => {
    if (!validateProducts()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // تجهيز بيانات الطلب للإرسال
      const orderData = {
        customerName: data.customerName,
        mobileNum: data.mobileNum,
        address: data.address,
        notes: data.notes || "",
        status: data.status,
        orderStatus: data.orderStatus,
        items: orderItems.map((item) => ({
          product: item.product,
          productName: item.productName,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      await orderService.updateOrder(id, orderData);
      toast.success("تم تحديث الطلب بنجاح");
      navigate(`/orders/${id}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("حدث خطأ أثناء تحديث الطلب");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="container mx-auto py-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">تعديل الطلب</h1>
        <Link
          to={`/orders/${id}`}
          className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <span>العودة للطلب</span>
          <FaArrowLeft className="mr-1" />
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* بيانات العميل */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              بيانات العميل
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  اسم العميل*
                </label>
                <input
                  id="customerName"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("customerName")}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="mobileNum"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  رقم الجوال*
                </label>
                <input
                  id="mobileNum"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("mobileNum")}
                />
                {errors.mobileNum && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mobileNum.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  العنوان*
                </label>
                <textarea
                  id="address"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("address")}
                ></textarea>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* تفاصيل الطلب */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              تفاصيل الطلب
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  حالة الطلب
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="status"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...field}
                    >
                      <option value="Pending">قيد الانتظار</option>
                      <option value="Shipped">تم الشحن</option>
                      <option value="Delivered">تم التسليم</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="orderStatus"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  حالة التسليم
                </label>
                <Controller
                  name="orderStatus"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="orderStatus"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...field}
                    >
                      <option value="Delivery">توصيل</option>
                      <option value="Returned">مرتجع</option>
                      <option value="Exchange">استبدال</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ملاحظات (اختياري)
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("notes")}
                  placeholder="إضافة ملاحظات..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* المنتجات */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">المنتجات</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center text-sm"
            >
              <FaPlus className="ml-1" /> إضافة منتج
            </button>
          </div>

          {productValidationError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
              <p>{productValidationError}</p>
            </div>
          )}

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج*
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكمية*
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر*
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المجموع
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <select
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={item.product || ""}
                        onChange={(e) =>
                          handleItemChange(index, "product", e.target.value)
                        }
                      >
                        <option value="">اختر منتج</option>
                        {products.map((product) => (
                          <option
                            key={product._id}
                            value={product._id}
                            selected={item.product === product._id}
                          >
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {(item.quantity * (item.price || 0)).toFixed(2)} ج.م
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={orderItems.length <= 1}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-4 py-3 text-left font-medium">
                    الإجمالي:
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">
                    {totalPrice.toFixed(2)} ج.م
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الحفظ...
              </span>
            ) : (
              "حفظ التعديلات"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrderPage;
