import React from "react";
import { motion } from "framer-motion";

/**
 * مكون دوار للإشارة إلى حالة التحميل
 * @param {Object} props - خصائص المكون
 * @param {string} [props.size='medium'] - حجم الدوار ('small', 'medium', 'large')
 * @param {string} [props.color='primary'] - لون الدوار ('primary', 'secondary', 'accent', أو أي لون tailwind)
 * @param {string} [props.text] - نص اختياري لعرضه مع الدوار
 * @returns {JSX.Element} مكون الدوار
 */
const Spinner = ({
  size = "medium",
  color = "primary",
  text = "جاري التحميل...",
}) => {
  // تحديد حجم الدوار بناءً على الخاصية size
  const sizeClasses = {
    small: "h-6 w-6 border-2",
    medium: "h-12 w-12 border-3",
    large: "h-16 w-16 border-4",
  };

  // تحديد لون الدوار بناءً على الخاصية color
  const colorClasses = {
    primary: "border-secondary",
    secondary: "border-primary",
    accent: "border-accent",
    blue: "border-blue-500",
    red: "border-red-500",
    green: "border-green-500",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`rounded-full border-t-transparent ${spinnerSize} ${spinnerColor}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

export default Spinner;
