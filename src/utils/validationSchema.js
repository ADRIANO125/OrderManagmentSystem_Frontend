import * as yup from "yup";

/**
 * مخططات التحقق من صحة البيانات باستخدام yup
 * للاستخدام مع React Hook Form
 */

// التحقق من صحة نموذج المنتج
export const productSchema = yup.object().shape({
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

// التحقق من صحة نموذج الطلب
export const orderSchema = yup.object().shape({
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

// التحقق من صحة عنصر الطلب (منتج في الطلب)
export const orderItemSchema = yup.object().shape({
  product: yup.string().required("المنتج مطلوب"),
  quantity: yup
    .number()
    .typeError("الكمية يجب أن تكون رقماً")
    .integer("الكمية يجب أن تكون رقماً صحيحاً")
    .positive("الكمية يجب أن تكون رقماً موجباً")
    .required("الكمية مطلوبة"),
  price: yup
    .number()
    .typeError("السعر يجب أن يكون رقماً")
    .min(0, "السعر يجب أن يكون رقماً موجباً أو صفر")
    .required("السعر مطلوب"),
});

// التحقق من صحة ملف الصورة
export const imageSchema = {
  validateImage: (file) => {
    if (!file) {
      return "الصورة مطلوبة";
    }

    // التحقق من نوع الملف
    if (!file.type.match("image.*")) {
      return "يرجى اختيار ملف صورة فقط";
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      return "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت";
    }

    return true;
  },
};

export default {
  productSchema,
  orderSchema,
  orderItemSchema,
  imageSchema,
};
