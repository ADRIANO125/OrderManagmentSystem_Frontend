/**
 * وظائف مساعدة لمعالجة مسارات الصور
 */

/**
 * تحويل مسار الصورة إلى URL كامل صالح للاستخدام
 * @param {string} imagePath - مسار الصورة النسبي من قاعدة البيانات
 * @returns {string} - عنوان URL كامل للصورة
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://dummyimage.com/400x300/e0e0e0/7a7a7a&text=صورة+غير+متوفرة";
  }

  try {
    // أولاً، تنظيف المسار - تحويل الباك سلاش إلى فورورد سلاش
    const normalizedPath = imagePath.replace(/\\/g, "/");

    // تفقد ما إذا كان المسار يحتوي بالفعل على uploads
    if (normalizedPath.includes("uploads/")) {
      // تجنب الازدواجية في المسار
      if (normalizedPath.includes("uploads/uploads/")) {
        return `${getBaseUrl()}/${normalizedPath.replace(
          "uploads/uploads/",
          "uploads/"
        )}`;
      }
      return `${getBaseUrl()}/${normalizedPath}`;
    }

    // إضافة بادئة uploads/ إذا لم تكن موجودة
    return `${getBaseUrl()}/uploads/${normalizedPath}`;
  } catch (error) {
    console.error("Error formatting image URL:", error);
    return "https://dummyimage.com/400x300/e0e0e0/7a7a7a&text=صورة+غير+متوفرة";
  }
};

/**
 * الحصول على عنوان URL الأساسي للخادم استناداً إلى البيئة الحالية
 * @returns {string} - عنوان URL الأساسي للخادم
 */
export const getBaseUrl = () => {
  // الحصول على البيئة الحالية من متغيرات البيئة أو استخدام القيمة الافتراضية
  const environment = process.env.NODE_ENV || "development";

  if (environment === "production") {
    // في بيئة الإنتاج، استخدام عنوان Railway
    return "https://ordermanagementsystem-production.up.railway.app";
  }

  // في بيئة التطوير، يمكن استخدام الخادم المحلي أو Railway حسب الحاجة
  return "https://ordermanagementsystem-production.up.railway.app";
};

/**
 * معالجة خطأ تحميل الصورة واستبدالها بصورة بديلة
 * @param {Event} event - حدث خطأ تحميل الصورة
 * @param {string} altText - نص بديل للصورة
 */
export const handleImageError = (event, altText = "صورة غير متوفرة") => {
  console.warn("تم استبدال الصورة غير المتوفرة بصورة بديلة");
  event.target.src = `https://dummyimage.com/400x300/e0e0e0/7a7a7a&text=${encodeURIComponent(
    altText
  )}`;
  event.target.alt = altText;
};

export default {
  getImageUrl,
  getBaseUrl,
  handleImageError,
};
