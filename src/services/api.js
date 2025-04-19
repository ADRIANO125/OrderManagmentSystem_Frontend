import axios from "axios";

// إنشاء مثيل من axios مع الإعدادات الأساسية
const api = axios.create({
  baseURL: "https://ordermanagementsystem-production.up.railway.app/api", // تم تحديث الرابط ليشير إلى السيرفر على Railway
  headers: {
    "Content-Type": "application/json",
  },
});

// نظام التخزين المؤقت المركزي
const cache = {
  orders: null,
  products: null,
  sales: null,

  // تحديد أقصى مدة صلاحية للتخزين المؤقت (15 دقيقة)
  cacheExpiry: 15 * 60 * 1000,
  lastFetchTime: {
    orders: 0,
    products: 0,
    sales: 0,
  },

  // التحقق من صلاحية التخزين المؤقت
  isCacheValid: function (type) {
    const now = Date.now();
    return (
      this[type] !== null && now - this.lastFetchTime[type] < this.cacheExpiry
    );
  },

  // تحديث التخزين المؤقت
  update: function (type, data) {
    this[type] = data;
    this.lastFetchTime[type] = Date.now();
  },

  // حذف التخزين المؤقت
  clear: function (type) {
    if (type) {
      this[type] = null;
      this.lastFetchTime[type] = 0;
    } else {
      this.orders = null;
      this.products = null;
      this.sales = null;
      this.lastFetchTime.orders = 0;
      this.lastFetchTime.products = 0;
      this.lastFetchTime.sales = 0;
    }
  },
};

// خدمات الطلبات
export const orderService = {
  getAllOrders: async () => {
    try {
      // استخدام التخزين المؤقت إذا كان صالحاً
      if (cache.isCacheValid("orders")) {
        return cache.orders;
      }

      const response = await api.get("/orders");
      cache.update("orders", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  getOrderById: async (id) => {
    try {
      // التحقق من وجود البيانات في التخزين المؤقت أولاً
      if (cache.isCacheValid("orders")) {
        const order = cache.orders.find((order) => order._id === id);
        if (order) return order;
      }

      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  addOrder: async (orderData) => {
    try {
      // التأكد من وجود بيانات الطلب
      if (!orderData || !orderData.items || orderData.items.length === 0) {
        throw new Error("بيانات الطلب غير صالحة");
      }

      const response = await api.post("/orders/add", orderData);
      // مسح التخزين المؤقت للطلبات
      cache.clear("orders");
      return response.data;
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/update/${id}`, orderData);
      // مسح التخزين المؤقت للطلبات
      cache.clear("orders");
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      // استخدام نفس طريقة تحديث الطلب مع إرسال حالة الطلب فقط
      const response = await api.put(`/orders/update/${id}`, { status });
      // مسح التخزين المؤقت للطلبات
      cache.clear("orders");
      return response.data;
    } catch (error) {
      console.error(`Error updating order status for ${id}:`, error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/delete/${id}`);
      // مسح التخزين المؤقت للطلبات
      cache.clear("orders");
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  },

  searchOrders: async (query) => {
    try {
      const response = await api.get("/orders/search", { params: query });
      return response.data;
    } catch (error) {
      console.error("Error searching orders:", error);
      throw error;
    }
  },

  printOrders: async () => {
    try {
      // سيقوم هذا بتنزيل ملف PDF
      window.open(`${api.defaults.baseURL}/orders/print`, "_blank");
      return { success: true };
    } catch (error) {
      console.error("Error printing orders:", error);
      throw error;
    }
  },
};

// خدمات المنتجات
export const productService = {
  getAllProducts: async () => {
    try {
      // استخدام التخزين المؤقت إذا كان صالحاً
      if (cache.isCacheValid("products")) {
        return cache.products;
      }

      const response = await api.get("/products");
      cache.update("products", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  clearCache: () => {
    cache.clear("products");
  },

  clearProductFromCache: (productId) => {
    if (cache.products) {
      cache.products = cache.products.filter(
        (product) => product._id !== productId
      );
    }
  },

  getProductById: async (id) => {
    try {
      // التحقق من وجود البيانات في التخزين المؤقت أولاً
      if (cache.isCacheValid("products")) {
        const product = cache.products.find((p) => p._id === id);
        if (product) return product;
      }

      // إذا لم يتم العثور على المنتج، قم بتحميل جميع المنتجات
      const products = await productService.getAllProducts();
      const product = products.find((p) => p._id === id);

      if (product) {
        return product;
      }

      // إذا لم يتم العثور على المنتج، رمي خطأ
      throw new Error(`Product with ID ${id} not found`);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  addProduct: async (productData) => {
    const formData = new FormData();

    // إضافة بيانات المنتج إلى FormData
    Object.keys(productData).forEach((key) => {
      if (key === "images" && productData[key] instanceof File) {
        formData.append(key, productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/products/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // مسح التخزين المؤقت للمنتجات
      cache.clear("products");
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    const formData = new FormData();

    // إضافة بيانات المنتج إلى FormData
    Object.keys(productData).forEach((key) => {
      if (key === "images" && productData[key] instanceof File) {
        formData.append(key, productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    try {
      const response = await axios.put(
        `${api.defaults.baseURL}/products/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // تحديث المنتج في التخزين المؤقت
      productService.clearProductFromCache(id);

      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/delete/${id}`);
      // مسح التخزين المؤقت للمنتجات
      cache.clear("products");
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

// خدمات المبيعات
export const saleService = {
  getAllSales: async () => {
    try {
      // استخدام التخزين المؤقت إذا كان صالحاً
      if (cache.isCacheValid("sales")) {
        return cache.sales;
      }

      const response = await api.get("/sales");
      cache.update("sales", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  },

  getSaleById: async (id) => {
    try {
      // التحقق من وجود البيانات في التخزين المؤقت أولاً
      if (cache.isCacheValid("sales")) {
        const sale = cache.sales.find((sale) => sale._id === id);
        if (sale) return sale;
      }

      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      throw error;
    }
  },

  addSale: async (saleData) => {
    try {
      const response = await api.post("/sales/add", saleData);
      // مسح التخزين المؤقت للمبيعات
      cache.clear("sales");
      return response.data;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  },

  updateSale: async (id, saleData) => {
    try {
      const response = await api.put(`/sales/update/${id}`, saleData);
      // مسح التخزين المؤقت للمبيعات
      cache.clear("sales");
      return response.data;
    } catch (error) {
      console.error(`Error updating sale ${id}:`, error);
      throw error;
    }
  },

  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/delete/${id}`);
      // مسح التخزين المؤقت للمبيعات
      cache.clear("sales");
      return response.data;
    } catch (error) {
      console.error(`Error deleting sale ${id}:`, error);
      throw error;
    }
  },

  getSalesStats: async () => {
    try {
      const response = await api.get("/sales/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching sales stats:", error);
      throw error;
    }
  },
};

export default api;
