/**
 * تنسيق التاريخ إلى تنسيق محلي عربي
 * @param {string|Date} date - التاريخ المراد تنسيقه
 * @param {object} options - خيارات التنسيق
 * @returns {string} - التاريخ المنسق
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "غير محدد";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ar-EG", defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return typeof date === "string" ? date : String(date);
  }
};

/**
 * تنسيق الرقم إلى تنسيق محلي مع عملة
 * @param {number} amount - المبلغ المراد تنسيقه
 * @param {string} currency - رمز العملة، افتراضيًا "ج.م"
 * @returns {string} - الرقم المنسق مع العملة
 */
export const formatCurrency = (amount, currency = "ج.م") => {
  if (amount === undefined || amount === null) return "غير محدد";

  try {
    const formatter = new Intl.NumberFormat("ar-EG", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${formatter.format(amount)} ${currency}`;
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${amount} ${currency}`;
  }
};

/**
 * تنسيق رقم الهاتف إلى الصيغة المصرية
 * @param {string} phoneNumber - رقم الهاتف المراد تنسيقه
 * @returns {string} - رقم الهاتف المنسق
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "غير محدد";

  // إزالة أي أحرف غير رقمية
  const cleaned = phoneNumber.replace(/\D/g, "");

  // التحقق من أن الرقم يبدأ بـ 0 أو +2 أو 20
  if (cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  } else if (cleaned.startsWith("20")) {
    return "+" + cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  } else {
    return phoneNumber;
  }
};
