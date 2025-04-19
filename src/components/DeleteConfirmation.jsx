import React from "react";
import { motion } from "framer-motion";

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">تأكيد الحذف</h2>
        <p className="text-gray-600 mb-6">
          هل أنت متأكد من أنك تريد حذف {itemName || "هذا العنصر"}؟ هذا الإجراء
          لا يمكن التراجع عنه.
        </p>
        <div className="flex justify-end space-x-3 rtl:space-x-reverse">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            إلغاء
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            حذف
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmation;
