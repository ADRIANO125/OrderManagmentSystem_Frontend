import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { productService } from "../services/api";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaTrash,
  FaEdit,
  FaTag,
  FaRuler,
  FaRulerVertical,
  FaWeight,
} from "react-icons/fa";
import { toast } from "react-toastify";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((product) => product._id !== id));
      toast.success("تم حذف المنتج بنجاح");
      setShowDeleteModal(null);
    } catch (err) {
      toast.error("حدث خطأ أثناء حذف المنتج");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تأثيرات الحركة
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (isLoading) {
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

  return (
    <div className="pb-10">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">إدارة المنتجات</h1>
            <p className="text-indigo-100">
              عرض وإدارة جميع المنتجات المتوفرة في النظام
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 md:mt-0"
          >
            <Link
              to="/products/new"
              className="flex items-center bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-full font-medium shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <FaPlus className="mr-2" />
              إضافة منتج جديد
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="w-full">
          <label htmlFor="search" className="sr-only">
            بحث
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="block w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pr-12 pl-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="البحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl text-gray-300 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 12H4m8-8v16"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            لا توجد منتجات
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "لا توجد نتائج مطابقة لبحثك. حاول بكلمات أخرى."
              : "لم يتم إضافة أي منتجات بعد. أضف منتجًا جديدًا للبدء."}
          </p>
          <Link
            to="/products/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            إضافة منتج جديد
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
                layout
              >
                <div className="relative h-64 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.productName}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => handleImageError(e, product.productName)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">
                        لا توجد صورة
                      </span>
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="bg-white/90 hover:bg-white text-indigo-700 px-4 py-2 rounded-lg mb-2 flex justify-center items-center transition-colors"
                    >
                      <FaEye className="mr-2" />
                      عرض التفاصيل
                    </Link>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Link
                        to={`/products/edit/${product._id}`}
                        className="bg-indigo-600/90 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex-1 flex justify-center items-center transition-colors"
                      >
                        <FaEdit className="mr-2" />
                        تعديل
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(product._id)}
                        className="bg-red-600/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex-1 flex justify-center items-center transition-colors"
                      >
                        <FaTrash className="mr-2" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                      {product.productName}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaRuler className="text-indigo-500 mr-1" />
                      <span>{product.width} سم</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaRulerVertical className="text-indigo-500 mr-1" />
                      <span>{product.height} سم</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaWeight className="text-indigo-500 mr-1" />
                      <span>{product.weight} كجم</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="mb-6 text-gray-600">
              هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا
              الإجراء.
            </p>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteModal)}
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

export default ProductsPage;
