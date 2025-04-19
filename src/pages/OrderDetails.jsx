import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaPrint } from "react-icons/fa";
import { orderService } from "../services/api";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import moment from "moment";
import "moment/locale/ar";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  moment.locale("ar");

  const statusOptions = [
    { value: "Pending", label: "قيد الانتظار", color: "bg-yellow-500" },
    { value: "Shipped", label: "تم الشحن", color: "bg-blue-500" },
    { value: "Delivered", label: "تم التسليم", color: "bg-green-500" },
  ];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(id);
        console.log("Order details:", data);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("حدث خطأ أثناء تحميل بيانات الطلب");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await orderService.updateOrderStatus(id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success("تم تحديث حالة الطلب بنجاح");
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("حدث خطأ أثناء تحديث حالة الطلب");
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await orderService.deleteOrder(id);
      toast.success("تم حذف الطلب بنجاح");
      navigate("/orders");
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("حدث خطأ أثناء حذف الطلب");
    }
  };

  // دالة الطباعة البسيطة
  const handlePrint = () => {
    try {
      if (!order) {
        toast.error("لا توجد بيانات للطباعة");
        return;
      }

      // إنشاء نافذة جديدة للطباعة
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast.error(
          "تم منع فتح النافذة المنبثقة، يرجى السماح بالنوافذ المنبثقة لهذا الموقع"
        );
        return;
      }

      // إعداد محتوى صفحة الطباعة
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>طباعة طلب #${order._id}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page { 
                size: A4; 
                margin: 0.5cm;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            :root {
              --primary-color: #4f46e5;
              --primary-light: #eef2ff;
              --primary-dark: #3730a3;
              --secondary-color: #10b981;
              --secondary-light: #ecfdf5;
              --accent-color: #f59e0b;
              --text-dark: #1f2937;
              --text-light: #6b7280;
              --bg-light: #f9fafb;
              --border-color: #e5e7eb;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Cairo', sans-serif;
              line-height: 1.5;
              color: var(--text-dark);
              direction: rtl;
              background-color: var(--bg-light);
              padding: 0;
              margin: 0;
              font-size: 12px;
            }
            .container {
              max-width: 100%;
              margin: 0 auto;
              background-color: white;
              position: relative;
            }
            .brand-header {
              background-color: #5046e5;
              color: white;
              text-align: center;
              padding: 15px 20px 30px;
              position: relative;
              overflow: hidden;
            }
            .brand-logo {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 5px;
            }
            .brand-logo svg {
              width: 40px;
              height: 40px;
              margin-left: 10px;
              fill: white;
            }
            .brand-header h1 {
              font-size: 22px;
              margin: 0;
              font-weight: 700;
            }
            .brand-header p {
              font-size: 12px;
              opacity: 0.9;
              margin-top: 2px;
            }
            .wave-bg {
              position: absolute;
              bottom: -10px;
              left: 0;
              width: 100%;
              height: 30px;
              fill: white;
            }
            .order-info {
              background-color: var(--primary-light);
              padding: 12px 15px;
              text-align: center;
              border-bottom: 1px solid var(--primary-color);
            }
            .order-info h2 {
              color: var(--primary-dark);
              font-size: 16px;
              margin-bottom: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .order-info h2 .order-id {
              font-family: monospace;
              direction: ltr;
              display: inline-block;
              margin-right: 5px;
            }
            .order-info p {
              color: var(--text-light);
              font-size: 12px;
              margin: 0;
            }
            .content {
              padding: 15px;
            }
            .section {
              margin-bottom: 15px;
              border-radius: 6px;
              overflow: hidden;
              border: 1px solid var(--border-color);
            }
            .section-title {
              background-color: var(--primary-light);
              color: var(--primary-dark);
              font-weight: bold;
              padding: 8px 10px;
              border-bottom: 1px solid var(--border-color);
              font-size: 13px;
              display: flex;
              align-items: center;
            }
            .section-title svg {
              margin-left: 6px;
              width: 14px;
              height: 14px;
            }
            .section-content {
              padding: 10px;
              background-color: white;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .info-item {
              margin-bottom: 4px;
              display: flex;
              align-items: center;
            }
            .info-item .icon {
              margin-left: 6px;
              color: var(--primary-color);
              width: 14px;
              height: 14px;
            }
            .label {
              font-weight: bold;
              color: var(--text-light);
              display: inline-block;
              min-width: 70px;
              margin-left: 5px;
              font-size: 11px;
            }
            .value {
              color: var(--text-dark);
              font-weight: 600;
              font-size: 11px;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: bold;
              text-align: center;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-shipped {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .status-delivered {
              background-color: #d1fae5;
              color: #065f46;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              border-radius: 6px;
              overflow: hidden;
              border: 1px solid var(--border-color);
              font-size: 11px;
            }
            th, td {
              border: 1px solid var(--border-color);
              padding: 8px;
              text-align: right;
            }
            th {
              background-color: var(--primary-light);
              color: var(--primary-dark);
              font-weight: bold;
              white-space: nowrap;
              font-size: 11px;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            tr.total {
              font-weight: bold;
              background-color: var(--primary-light);
              color: var(--primary-dark);
            }
            .notes-content {
              background-color: var(--secondary-light);
              padding: 8px;
              border-radius: 6px;
              border-right: 3px solid var(--secondary-color);
              font-size: 11px;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 10px;
              color: var(--text-light);
              border-top: 1px solid var(--border-color);
              padding: 10px 0;
              background-color: var(--primary-light);
            }
            .footer p {
              margin: 0;
              line-height: 1.4;
            }
            .print-btn {
              text-align: center;
              margin: 15px 0;
            }
            .print-btn button {
              padding: 8px 15px;
              background: var(--secondary-color);
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              font-family: 'Cairo', sans-serif;
              display: flex;
              align-items: center;
              margin: 0 auto;
              transition: all 0.3s ease;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .print-btn button:hover {
              background: #0d9668;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            .print-btn svg {
              margin-left: 8px;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 7em;
              color: rgba(79, 70, 229, 0.03);
              z-index: 0;
              pointer-events: none;
              white-space: nowrap;
            }
            .qr-code {
              text-align: center;
              margin-top: 15px;
            }
            .qr-code img {
              max-width: 80px;
              height: auto;
            }
            .qr-code p {
              font-size: 10px;
              margin-top: 2px;
              color: var(--text-light);
            }
            .compact-layout .section {
              margin-bottom: 10px;
            }
            .compact-layout .section-title {
              padding: 6px 10px;
            }
            .compact-layout .section-content {
              padding: 8px;
            }
            .compact-layout .info-grid {
              gap: 5px;
            }
            .compact-layout .footer {
              margin-top: 10px;
              padding: 8px 0;
            }
            @media print {
              body {
                background-color: white;
                min-height: 0 !important;
              }
              .container {
                box-shadow: none;
                margin: 0;
                width: 100%;
                max-width: 100%;
                min-height: auto;
              }
              .print-btn, .no-print {
                display: none !important;
              }
            }
            @media screen {
              .container {
                margin: 20px auto;
                padding-bottom: 30px;
                max-width: 21cm;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
              }
            }
          </style>
        </head>
        <body>
          <div class="container compact-layout">
            <div class="brand-header">
              <div class="brand-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                  <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clip-rule="evenodd" />
                </svg>
                <h1>نظام إدارة الطلبات</h1>
              </div>
              <p>خدمة العملاء وإدارة الطلبات بكل سهولة</p>
              <svg class="wave-bg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
              </svg>
            </div>
            
            <div class="order-info">
              <h2>إيصال الطلب <span class="order-id">${order._id.substring(
                0,
                8
              )}</span></h2>
              <p>تاريخ الطلب: ${formatDate(order.createdAt)}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  معلومات العميل
                </div>
                <div class="section-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                        </svg>
                      </div>
                      <span class="label">الاسم:</span>
                      <span class="value">${order.customerName || "-"}</span>
                    </div>
                    <div class="info-item">
                      <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                        </svg>
                      </div>
                      <span class="label">رقم الجوال:</span>
                      <span class="value" dir="ltr">${
                        order.mobileNum || "-"
                      }</span>
                    </div>
                    <div class="info-item">
                      <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                          <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                      </div>
                      <span class="label">العنوان:</span>
                      <span class="value">${order.address || "-"}</span>
                    </div>
                    <div class="info-item">
                      <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935zM3.504 1c.007.517.026 1.006.056 1.469.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.501.501 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667.03-.463.049-.952.056-1.469H3.504z"/>
                        </svg>
                      </div>
                      <span class="label">حالة الطلب:</span>
                      <span class="status-badge ${
                        order.status === "Pending"
                          ? "status-pending"
                          : order.status === "Shipped"
                          ? "status-shipped"
                          : "status-delivered"
                      }">${getStatusLabel(order.status) || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                  </svg>
                  المنتجات
                </div>
                <div class="section-content">
                  <table>
                    <thead>
                      <tr>
                        <th width="48%">المنتج</th>
                        <th>السعر</th>
                        <th>الكمية</th>
                        <th>الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        order.items && order.items.length > 0
                          ? order.items
                              .map(
                                (item) => `
                          <tr>
                            <td>${item.productName || item.product || "-"}</td>
                            <td>${item.price || 0} ج.م</td>
                            <td>${item.quantity || 1}</td>
                            <td>${calculateItemTotal(item)} ج.م</td>
                          </tr>
                        `
                              )
                              .join("")
                          : `<tr><td colspan="4" style="text-align: center;">لا توجد منتجات</td></tr>`
                      }
                      <tr class="total">
                        <td colspan="3" style="text-align: left;">الإجمالي</td>
                        <td>${order.totalPrice || 0} ج.م</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              ${
                order.notes
                  ? `
                <div class="section">
                  <div class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                    </svg>
                    ملاحظات
                  </div>
                  <div class="section-content">
                    <div class="notes-content">${order.notes}</div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>تم إنشاء هذا الإيصال في ${new Date().toLocaleString(
                "ar-EG"
              )}</p>
              <p>جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} - نظام إدارة الطلبات</p>
            </div>
            
            <div class="watermark">نظام إدارة الطلبات</div>
            
            <div class="print-btn">
              <button onclick="window.print(); window.close();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5z"/>
                  <path d="M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                </svg>
                طباعة الإيصال
              </button>
            </div>
          </div>
        </body>
        </html>
      `);

      // إغلاق document للتأكد من تحميله بشكل كامل
      printWindow.document.close();

      // تركيز على النافذة الجديدة
      printWindow.focus();

      toast.success("تم إنشاء صفحة الطباعة بنجاح");
    } catch (error) {
      console.error("خطأ في الطباعة:", error);
      toast.error("حدث خطأ أثناء الطباعة");
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.color : "bg-gray-500";
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.label : status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    try {
      return moment(dateString).format("DD MMMM YYYY - HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // حساب القيمة الإجمالية للمنتجات
  const calculateItemTotal = (item) => {
    return (item.price * (item.quantity || 1)).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">
          لم يتم العثور على الطلب
        </h3>
        <div className="mt-6">
          <Link
            to="/orders"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            العودة للطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <motion.div
          className="flex items-center space-x-2 rtl:space-x-reverse"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/orders"
            className="flex items-center px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <FaArrowLeft className="ml-1" />
            <span>العودة للطلبات</span>
          </Link>
        </motion.div>
        <motion.div
          className="flex items-center space-x-2 rtl:space-x-reverse"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <FaPrint className="ml-1" />
            <span>طباعة</span>
          </button>
          <Link
            to={`/orders/edit/${id}`}
            className="flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <FaEdit className="ml-1" />
            <span>تعديل</span>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-indigo-600 px-6 py-4 text-white">
          <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
          <p className="text-sm text-indigo-200">رقم الطلب: {order._id}</p>
          <p className="text-sm text-indigo-200">
            تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString("ar-EG")}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-700 mb-4 border-b border-indigo-200 pb-2">
                معلومات العميل
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-500 w-24">الاسم:</span>
                  <span className="text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-500 w-24">
                    رقم الجوال:
                  </span>
                  <span className="text-gray-900" dir="ltr">
                    {order.mobileNum || "-"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-500 w-24">
                    العنوان:
                  </span>
                  <span className="text-gray-900">{order.address || "-"}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-lg font-bold text-blue-700 mb-4 border-b border-blue-200 pb-2">
                معلومات الطلب
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-500 w-24">
                    الحالة:
                  </span>
                  <select
                    value={order.status}
                    onChange={handleStatusChange}
                    className="form-select w-full max-w-xs p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pending">قيد الانتظار</option>
                    <option value="Shipped">تم الشحن</option>
                    <option value="Delivered">تم التسليم</option>
                  </select>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-500 w-24">
                      المنتج:
                    </span>
                    <span className="text-gray-900">
                      {order.items[0].productName ||
                        order.items[0].product ||
                        "-"}
                      {order.items.length > 1 &&
                        ` + ${order.items.length - 1} منتجات أخرى`}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="font-medium text-gray-500 w-24">
                    السعر الكلي:
                  </span>
                  <span className="text-gray-900 font-bold">
                    {order.totalPrice} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">
              المنتجات
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المنتج
                    </th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.productName || item.product || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.price || 0} ج.م
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity || 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {calculateItemTotal(item)} ج.م
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-3 text-center text-sm text-gray-500"
                      >
                        لا توجد منتجات
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-semibold">
                    <td
                      colSpan="3"
                      className="px-4 py-3 text-sm text-gray-900 text-left"
                    >
                      الإجمالي
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.totalPrice || 0} ج.م
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
              <h3 className="text-lg font-bold text-yellow-700 mb-2 border-b border-yellow-200 pb-2">
                ملاحظات
              </h3>
              <p className="text-gray-800 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetails;
