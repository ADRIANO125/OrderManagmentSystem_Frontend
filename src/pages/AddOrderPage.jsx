import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { orderService, productService } from "../services/api";
import { FaTrash, FaPlus, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";

const AddOrderPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      customerName: "",
      mobileNum: "",
      address: "",
      status: "Pending",
      orderStatus: "Delivery",
      items: [{ product: "", price: "", quantity: 1 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const watchItems = watch("items");

  // حساب السعر الإجمالي
  const calculateTotal = () => {
    if (!watchItems) return 0;
    return watchItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // تحديث السعر عند اختيار منتج
  const handleProductChange = (index, productName) => {
    const selectedProduct = products.find((p) => p.productName === productName);
    if (selectedProduct) {
      setValue(`items.${index}.price`, selectedProduct.price);
      setValue(`items.${index}.product`, selectedProduct.productName);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // تحويل النصوص إلى أرقام وإضافة اسم المنتج
      const formattedData = {
        ...data,
        items: data.items.map((item) => {
          const selectedProduct = products.find(
            (p) => p.productName === item.product
          );
          return {
            product: selectedProduct ? selectedProduct._id : "",
            productName: item.product,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
          };
        }),
      };

      await orderService.addOrder(formattedData);
      toast.success("تم إضافة الطلب بنجاح");
      reset();
      navigate("/orders");
    } catch (err) {
      console.error("Error adding order:", err);
      setError("حدث خطأ أثناء إضافة الطلب. يرجى المحاولة مرة أخرى.");
      toast.error("فشل في إضافة الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewProduct = () => {
    append({ product: "", price: "", quantity: 1 });
  };

  if (isLoadingProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          إضافة طلب جديد
        </h1>
      </motion.div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <motion.div
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* بيانات العميل */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-indigo-50 py-3 px-4 border-b border-indigo-100">
                <h2 className="text-xl font-semibold text-indigo-800">
                  بيانات العميل
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-gray-700 mb-1"
                  >
                    اسم العميل
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    className={`w-full p-2 border rounded-lg ${
                      errors.customerName ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    {...register("customerName", {
                      required: "اسم العميل مطلوب",
                    })}
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mobileNum"
                    className="block text-gray-700 mb-1"
                  >
                    رقم الجوال
                  </label>
                  <div className="relative">
                    <input
                      id="mobileNum"
                      type="text"
                      maxLength="11"
                      className={`w-full p-2 border rounded-lg ${
                        errors.mobileNum ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      {...register("mobileNum", {
                        required: "رقم الجوال مطلوب",
                        pattern: {
                          value: /^01[0-9]{9}$/,
                          message: "يجب أن يبدأ الرقم بـ 01 ويتكون من 11 رقم",
                        },
                        minLength: {
                          value: 11,
                          message: "يجب أن يتكون الرقم من 11 رقم",
                        },
                        maxLength: {
                          value: 11,
                          message: "يجب أن يتكون الرقم من 11 رقم",
                        },
                      })}
                    />
                    {watch("mobileNum")?.length === 11 && !errors.mobileNum && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-green-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  {errors.mobileNum && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mobileNum.message}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-500 flex justify-between items-center">
                    <span>
                      عدد الأرقام المدخلة: {watch("mobileNum")?.length || 0}
                    </span>
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${
                          ((watch("mobileNum")?.length || 0) / 11) * 100
                        }%`,
                        backgroundColor: errors.mobileNum
                          ? "#EF4444"
                          : watch("mobileNum")?.length === 11
                          ? "#10B981"
                          : "#6366F1",
                      }}
                      className="h-1 rounded-full mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-gray-700 mb-1">
                    العنوان
                  </label>
                  <textarea
                    id="address"
                    rows="3"
                    className={`w-full p-2 border rounded-lg ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    {...register("address", { required: "العنوان مطلوب" })}
                  ></textarea>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-gray-700 mb-1"
                    >
                      حالة الطلب
                    </label>
                    <select
                      id="status"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register("status")}
                    >
                      <option value="Pending">قيد الانتظار</option>
                      <option value="Shipped">تم الشحن</option>
                      <option value="Delivered">تم التسليم</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="orderStatus"
                      className="block text-gray-700 mb-1"
                    >
                      حالة التسليم
                    </label>
                    <select
                      id="orderStatus"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register("orderStatus")}
                    >
                      <option value="Delivery">توصيل</option>
                      <option value="Returned">مرتجع</option>
                      <option value="Exchange">استبدال</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    id="notes"
                    rows="2"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register("notes")}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* تفاصيل المنتجات */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-indigo-50 py-3 px-4 border-b border-indigo-100">
                <h2 className="text-xl font-semibold text-indigo-800">
                  تفاصيل المنتجات
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-gray-50 p-4 rounded-lg relative"
                    >
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <FaBoxOpen className="text-indigo-500 mr-2" />
                        المنتج {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 lg:col-span-1">
                          <label className="block text-gray-700 mb-1">
                            اسم المنتج
                          </label>
                          <select
                            {...register(`items.${index}.product`, {
                              required: "يرجى اختيار المنتج",
                            })}
                            onChange={(e) =>
                              handleProductChange(index, e.target.value)
                            }
                            className={`w-full p-2 border rounded-lg ${
                              errors.items?.[index]?.product
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          >
                            <option value="">اختر المنتج</option>
                            {products.map((product) => (
                              <option
                                key={product._id}
                                value={product.productName}
                              >
                                {product.productName}
                              </option>
                            ))}
                          </select>
                          {errors.items?.[index]?.product && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index].product.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-1">
                            السعر
                          </label>
                          <input
                            type="text"
                            className={`w-full p-2 border rounded-lg ${
                              errors.items?.[index]?.price
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            {...register(`items.${index}.price`, {
                              required: "السعر مطلوب",
                              pattern: {
                                value: /^\d+(\.\d{1,2})?$/,
                                message: "أدخل سعر صحيح",
                              },
                            })}
                          />
                          {errors.items?.[index]?.price && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index].price.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-1">
                            الكمية
                          </label>
                          <input
                            type="number"
                            min="1"
                            className={`w-full p-2 border rounded-lg ${
                              errors.items?.[index]?.quantity
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            {...register(`items.${index}.quantity`, {
                              required: "الكمية مطلوبة",
                              min: {
                                value: 1,
                                message: "الكمية على الأقل 1",
                              },
                            })}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index].quantity.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="absolute top-2 left-2 text-red-500 hover:text-red-700"
                          onClick={() => remove(index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="flex items-center justify-center w-full py-2 mt-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    onClick={addNewProduct}
                  >
                    <FaPlus className="mr-1" />
                    إضافة منتج آخر
                  </button>

                  <div className="mt-4 text-left pt-4 border-t border-gray-200">
                    <div className="text-lg font-semibold text-indigo-800">
                      إجمالي الطلب: {calculateTotal()} ج.م
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <motion.button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    جاري الإضافة...
                  </span>
                ) : (
                  "إضافة الطلب"
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddOrderPage;
