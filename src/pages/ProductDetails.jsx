import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { productService } from "../services/api";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaRuler,
  FaRulerVertical,
  FaWeight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/formatters";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل بيانات المنتج");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(id);
      toast.success("تم حذف المنتج بنجاح");
      navigate("/products");
    } catch (err) {
      toast.error("حدث خطأ أثناء حذف المنتج");
    }
  };

  // تقديم المنتج التالي
  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % product.images.length
      );
    }
  };

  // تقديم المنتج السابق
  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex(
        (prevIndex) =>
          (prevIndex - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">
          لم يتم العثور على المنتج
        </h3>
        <div className="mt-6">
          <Link
            to="/products"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <motion.div
          className="flex items-center space-x-2 rtl:space-x-reverse"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/products"
            className="flex items-center px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <FaArrowLeft className="ml-1" />
            <span>العودة للمنتجات</span>
          </Link>
        </motion.div>
        <motion.div
          className="flex items-center space-x-2 rtl:space-x-reverse"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to={`/products/edit/${id}`}
            className="flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <FaEdit className="ml-1" />
            <span>تعديل</span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <FaTrash className="ml-1" />
            <span>حذف</span>
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* قسم الصور والعرض */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-96 bg-gradient-to-r from-indigo-50 to-purple-50">
            {product.images && product.images.length > 0 ? (
              <>
                <div
                  className={`relative h-full overflow-hidden ${
                    isImageZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                >
                  <img
                    src={getImageUrl(product.images[currentImageIndex])}
                    alt={product.productName}
                    className={`w-full h-full object-contain transition-transform duration-500 ${
                      isImageZoomed ? "scale-150" : "scale-100"
                    }`}
                    onError={(e) => handleImageError(e, product.productName)}
                  />
                </div>
                {product.images.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      onClick={prevImage}
                      aria-label="الصورة السابقة"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      onClick={nextImage}
                      aria-label="الصورة التالية"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400 text-xl">لا توجد صورة</span>
              </div>
            )}
          </div>

          {/* معرض الصور المصغرة */}
          {product.images && product.images.length > 1 && (
            <div className="py-4 px-6 overflow-x-auto">
              <div className="flex space-x-3 rtl:space-x-reverse">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-indigo-500 shadow-md"
                        : "border-gray-200 opacity-70"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.productName} - صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, "صورة مصغرة")}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* معلومات المنتج */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.productName}
            </h1>

            <div className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-primary mb-2">
                  المواصفات
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">العرض</div>
                    <div className="flex items-center">
                      <FaRuler className="text-indigo-500 mr-2" />
                      <span className="font-medium">{product.width} سم</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">الارتفاع</div>
                    <div className="flex items-center">
                      <FaRulerVertical className="text-indigo-500 mr-2" />
                      <span className="font-medium">{product.height} سم</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">الوزن</div>
                    <div className="flex items-center">
                      <FaWeight className="text-indigo-500 mr-2" />
                      <span className="font-medium">{product.weight} كجم</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-primary mb-2">
                  معلومات إضافية
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-gray-500">معرف المنتج:</span>
                    <span className="font-mono text-sm ml-2">
                      {product._id}
                    </span>
                  </div>
                  {product.createdAt && (
                    <div>
                      <span className="text-gray-500">تاريخ الإضافة:</span>
                      <span className="ml-2">
                        {formatDate(product.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/products/edit/${id}`}
                    className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    تعديل المنتج
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <FaTrash className="mr-2" />
                    حذف المنتج
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف المنتج "{product.productName}"؟ هذا الإجراء لا
              يمكن التراجع عنه.
            </p>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                نعم، حذف المنتج
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
