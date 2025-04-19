import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";

// ربما تحتاج لتعديل هذا المسار حسب هيكل مشروعك
import { productService, orderService } from "../services/api";

// مخطط التحقق من صحة البيانات
const validationSchema = yup.object().shape({
  customerName: yup
    .string()
    .required("اسم العميل مطلوب")
    .min(4, "يجب أن يحتوي اسم العميل على 4 أحرف على الأقل"),
  customerPhone: yup
    .string()
    .required("رقم الهاتف مطلوب")
    .matches(/^01[0-9]{9}$/, "يجب أن يتكون رقم الهاتف من 11 رقم ويبدأ بـ 01"),
  customerAddress: yup
    .string()
    .required("عنوان العميل مطلوب")
    .min(10, "يجب أن يحتوي العنوان على 10 أحرف على الأقل"),
  customerEmail: yup.string().email("البريد الإلكتروني غير صالح").nullable(),
  notes: yup.string().nullable(),
  status: yup
    .string()
    .required("حالة الطلب مطلوبة")
    .oneOf(
      ["pending", "processing", "completed", "cancelled"],
      "حالة الطلب غير صالحة"
    ),
});

const AddOrderForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([
    { product: "", productName: "", quantity: 1, price: 0 },
  ]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [productValidationError, setProductValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerEmail: "",
      notes: "",
      status: "pending",
    },
  });

  // جلب المنتجات عند تحميل الصفحة
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("حدث خطأ أثناء تحميل المنتجات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
    newItems[index][field] = value;

    // إذا تم تغيير المنتج، قم بتحديث اسم المنتج والسعر
    if (field === "product" && value) {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct) {
        newItems[index].productName = selectedProduct.productName;
        newItems[index].price = 100; // يمكنك تعديل هذا حسب منطق التسعير في تطبيقك
      }
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
    // التحقق من صحة المنتجات
    if (!validateProducts()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // إعداد بيانات الطلب
      const orderData = {
        customerName: data.customerName,
        mobileNum: data.customerPhone,
        address: data.customerAddress,
        items: orderItems.map((item) => ({
          product: item.product,
          productName: item.productName,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        totalPrice: totalPrice,
        status: data.status,
        notes: data.notes || "",
      };

      // إرسال بيانات الطلب للواجهة الخلفية
      await orderService.addOrder(orderData);

      toast.success("تم إضافة الطلب بنجاح");
      reset();
      setOrderItems([{ product: "", productName: "", quantity: 1, price: 0 }]);
      setTotalPrice(0);
      navigate("/orders");
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("حدث خطأ أثناء إضافة الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <motion.h1
        className="text-3xl font-bold text-primary mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        إضافة طلب جديد
      </motion.h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          {/* بيانات العميل */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b">
              بيانات العميل
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="form-label">
                  اسم العميل*
                </label>
                <input
                  id="customerName"
                  type="text"
                  className={`form-input w-full ${
                    errors.customerName ? "border-red-500" : ""
                  }`}
                  {...register("customerName")}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customerPhone" className="form-label">
                  رقم الهاتف*
                </label>
                <input
                  id="customerPhone"
                  type="text"
                  className={`form-input w-full ${
                    errors.customerPhone ? "border-red-500" : ""
                  }`}
                  {...register("customerPhone")}
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customerAddress" className="form-label">
                  العنوان*
                </label>
                <textarea
                  id="customerAddress"
                  rows="3"
                  className={`form-textarea w-full ${
                    errors.customerAddress ? "border-red-500" : ""
                  }`}
                  {...register("customerAddress")}
                ></textarea>
                {errors.customerAddress && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerAddress.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customerEmail" className="form-label">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  className={`form-input w-full ${
                    errors.customerEmail ? "border-red-500" : ""
                  }`}
                  {...register("customerEmail")}
                />
                {errors.customerEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* تفاصيل الطلب */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b">
              تفاصيل الطلب
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="form-label">
                  حالة الطلب
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="status"
                      className={`form-select w-full ${
                        errors.status ? "border-red-500" : ""
                      }`}
                      {...field}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  )}
                />
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="form-label">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  className={`form-textarea w-full ${
                    errors.notes ? "border-red-500" : ""
                  }`}
                  {...register("notes")}
                ></textarea>
                {errors.notes && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* المنتجات */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-xl font-bold text-primary">المنتجات</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-primary btn-sm"
            >
              <FaPlus className="mr-1" /> إضافة منتج
            </button>
          </div>

          {productValidationError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              <p>{productValidationError}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-gray-200 rounded-lg"
                >
                  <div className="md:col-span-5">
                    <label className="form-label">المنتج*</label>
                    <select
                      className="form-select w-full"
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                    >
                      <option value="">اختر منتج</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">الكمية*</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input w-full"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="form-label">السعر*</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input w-full"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="btn btn-error btn-sm w-full"
                      disabled={orderItems.length <= 1}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="md:col-span-1">
                    <p className="form-label">المجموع</p>
                    <p className="font-bold">
                      {(item.quantity * (item.price || 0)).toFixed(2)} جنيه
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-xl font-bold">
              الإجمالي:{" "}
              <span className="text-primary">{totalPrice.toFixed(2)} جنيه</span>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
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
              "إضافة الطلب"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrderForm;
