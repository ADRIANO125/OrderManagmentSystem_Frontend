import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { FaUpload, FaTrash } from "react-icons/fa";

// ربما تحتاج لتعديل هذا المسار حسب هيكل مشروعك
import { productService } from "../services/api";

// مخطط التحقق من صحة البيانات
const validationSchema = yup.object().shape({
  productName: yup
    .string()
    .required("اسم المنتج مطلوب")
    .min(3, "يجب أن يحتوي اسم المنتج على 3 أحرف على الأقل")
    .max(50, "يجب أن لا يتجاوز اسم المنتج 50 حرفاً"),
  width: yup
    .number()
    .typeError("العرض يجب أن يكون رقماً")
    .positive("العرض يجب أن يكون رقماً موجباً")
    .required("العرض مطلوب"),
  height: yup
    .number()
    .typeError("الارتفاع يجب أن يكون رقماً")
    .positive("الارتفاع يجب أن يكون رقماً موجباً")
    .required("الارتفاع مطلوب"),
  weight: yup
    .number()
    .typeError("الوزن يجب أن يكون رقماً")
    .positive("الوزن يجب أن يكون رقماً موجباً")
    .required("الوزن مطلوب"),
});

const AddProductForm = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إعداد React Hook Form مع مخطط التحقق
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  // معالجة تغيير الصورة
  const handleImageChange = (e) => {
    setImageError("");

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // التحقق من نوع الملف
      if (!file.type.match("image.*")) {
        setImageError("يرجى اختيار ملف صورة فقط");
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
        return;
      }

      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // إزالة الصورة المختارة
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };

  // معالجة تقديم النموذج
  const onSubmit = async (data) => {
    // التحقق من وجود صورة
    if (!selectedImage) {
      setImageError("صورة المنتج مطلوبة");
      return;
    }

    try {
      setIsSubmitting(true);

      // إعداد بيانات المنتج مع الصورة
      const productData = {
        ...data,
        image: selectedImage,
      };

      // إرسال بيانات المنتج للواجهة الخلفية
      await productService.addProduct(productData);

      toast.success("تم إضافة المنتج بنجاح");
      reset();
      handleRemoveImage();
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">
          إضافة منتج جديد
        </h1>
      </motion.div>

      <motion.div
        className="bg-white shadow-md rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* بيانات المنتج */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-primary">
                بيانات المنتج
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="productName" className="form-label">
                    اسم المنتج <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    className={`form-input w-full ${
                      errors.productName ? "border-red-500" : ""
                    }`}
                    {...register("productName")}
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.productName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="width" className="form-label">
                    العرض (سم) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="width"
                    type="number"
                    step="0.01"
                    className={`form-input w-full ${
                      errors.width ? "border-red-500" : ""
                    }`}
                    {...register("width")}
                  />
                  {errors.width && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.width.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="height" className="form-label">
                    الارتفاع (سم) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="height"
                    type="number"
                    step="0.01"
                    className={`form-input w-full ${
                      errors.height ? "border-red-500" : ""
                    }`}
                    {...register("height")}
                  />
                  {errors.height && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.height.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="weight" className="form-label">
                    الوزن (كجم) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="weight"
                    type="number"
                    step="0.01"
                    className={`form-input w-full ${
                      errors.weight ? "border-red-500" : ""
                    }`}
                    {...register("weight")}
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.weight.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* صورة المنتج */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-primary">
                صورة المنتج <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-4">
                <div className="mt-1">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                      imageError ? "border-red-500" : "border-gray-300"
                    } border-dashed rounded-md`}
                  >
                    <div className="space-y-1 text-center">
                      {previewImage ? (
                        <div>
                          <img
                            src={previewImage}
                            alt="معاينة المنتج"
                            className="mx-auto h-32 w-auto object-contain mb-4"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                          >
                            <FaTrash className="inline mr-1" /> إزالة الصورة
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m12 0a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label
                              htmlFor="image"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                            >
                              <span className="px-3 py-2 rounded-md bg-indigo-50 hover:bg-indigo-100">
                                <FaUpload className="inline mr-1" /> اختر صورة
                              </span>
                            </label>
                            <p className="pr-1 mt-2">أو اسحب وأفلت هنا</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF حتى 5 ميجابايت
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {imageError && (
                    <p className="mt-1 text-sm text-red-600">{imageError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate("/products")}
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
                  "حفظ المنتج"
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProductForm;
