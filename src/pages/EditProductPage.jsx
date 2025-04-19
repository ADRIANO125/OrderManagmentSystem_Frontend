import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { productService } from "../services/api";
import { toast } from "react-toastify";
import { getBaseUrl } from "../utils/imageHelper";

const EditProductPage = () => {
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        console.log(`Attempting to fetch product with ID: ${id}`);
        const data = await productService.getProductById(id);

        if (!data) {
          console.error("No product data returned for ID:", id);
          setError("لم يتم العثور على المنتج");
          setIsLoading(false);
          return;
        }

        console.log("Successfully fetched product:", data);
        setProduct(data);

        // Populate form with existing data
        setValue("productName", data.productName || "");
        setValue("width", data.width || 0);
        setValue("height", data.height || 0);
        setValue("weight", data.weight || 0);

        // Set preview image if available
        if (data.images && data.images.length > 0) {
          console.log("Setting preview image:", data.images[0]);
          const imagePath = data.images[0].replace(/\\/g, "/");
          setPreviewImage(
            `${getBaseUrl()}/${
              imagePath.includes("uploads/")
                ? imagePath
                : `uploads/${imagePath}`
            }`
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("حدث خطأ أثناء تحميل بيانات المنتج");
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, setValue]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // إنشاء كائن بيانات المنتج بالحقول التي يحتاجها الخادم
      const productData = {
        productName: data.productName,
        width: data.width,
        height: data.height,
        weight: data.weight,
      };

      // إضافة الصورة إذا تم اختيار صورة جديدة
      if (selectedImage) {
        productData.images = selectedImage;
      }

      // تحديث المنتج
      const result = await productService.updateProduct(id, productData);

      // مسح ذاكرة التخزين المؤقت للتأكد من تحميل البيانات المحدثة
      productService.clearCache();

      toast.success("تم تحديث المنتج بنجاح");
      navigate(`/products/${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
      setError("حدث خطأ أثناء تحديث المنتج");
      toast.error("فشل تحديث المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
        <p>{error}</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          العودة للمنتجات
        </button>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-6">
          تعديل المنتج: {product?.productName}
        </h1>
      </motion.div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

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
                    اسم المنتج
                  </label>
                  <input
                    id="productName"
                    type="text"
                    className={`form-input ${
                      errors.productName ? "border-red-500" : ""
                    }`}
                    {...register("productName", { required: true })}
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-600">
                      اسم المنتج مطلوب
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="width" className="form-label">
                    العرض (سم)
                  </label>
                  <input
                    id="width"
                    type="number"
                    step="0.01"
                    className={`form-input ${
                      errors.width ? "border-red-500" : ""
                    }`}
                    {...register("width", { required: true, min: 0 })}
                  />
                  {errors.width && (
                    <p className="mt-1 text-sm text-red-600">
                      العرض مطلوب ويجب أن يكون رقم موجب
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="height" className="form-label">
                    الارتفاع (سم)
                  </label>
                  <input
                    id="height"
                    type="number"
                    step="0.01"
                    className={`form-input ${
                      errors.height ? "border-red-500" : ""
                    }`}
                    {...register("height", { required: true, min: 0 })}
                  />
                  {errors.height && (
                    <p className="mt-1 text-sm text-red-600">
                      الارتفاع مطلوب ويجب أن يكون رقم موجب
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="weight" className="form-label">
                    الوزن (كجم)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    step="0.01"
                    className={`form-input ${
                      errors.weight ? "border-red-500" : ""
                    }`}
                    {...register("weight", { required: true, min: 0 })}
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">
                      الوزن مطلوب ويجب أن يكون رقم موجب
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* صورة المنتج */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-primary">
                صورة المنتج
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="images" className="form-label">
                    صورة المنتج
                  </label>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {previewImage ? (
                        <div>
                          <img
                            src={previewImage}
                            alt="معاينة المنتج"
                            className="mx-auto h-32 w-auto object-contain mb-4"
                          />
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
                              htmlFor="images"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-blue-600 focus:outline-none"
                            >
                              <span>اختر صورة</span>
                            </label>
                            <p className="pr-1">أو اسحب وأفلت هنا</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF حتى 10 ميجابايت
                          </p>
                        </>
                      )}
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
                onClick={() => navigate(`/products/${id}`)}
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
                  "حفظ التغييرات"
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProductPage;
