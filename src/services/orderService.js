import axios from "axios";

// استخدام عنوان Railway للإنتاج
const API_URL = "https://ordermanagementsystem-production.up.railway.app/api";

// إحضار كل الطلبات
export const getAllOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const response = await axios.get(`${API_URL}/orders?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// إحضار طلب واحد بواسطة المعرف
export const getOrderById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// إنشاء طلب جديد
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// تحديث طلب موجود
export const updateOrder = async (id, orderData) => {
  try {
    const response = await axios.put(`${API_URL}/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

// حذف طلب
export const deleteOrder = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
};

// تحديث حالة الطلب
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating order status for ${id}:`, error);
    throw error;
  }
};

// البحث عن الطلبات
export const searchOrders = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/orders/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching orders with query "${query}":`, error);
    throw error;
  }
};

// تصفية الطلبات حسب الحالة
export const filterOrdersByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_URL}/orders/filter`, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.error(`Error filtering orders by status "${status}":`, error);
    throw error;
  }
};

// الحصول على إحصائيات الطلبات
export const getOrderStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    throw error;
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  searchOrders,
  filterOrdersByStatus,
  getOrderStats,
};
