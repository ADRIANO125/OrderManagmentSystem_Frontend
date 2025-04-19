import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">نظام إدارة الطلبات</h3>
            <p className="text-gray-300">
              نظام متكامل لإدارة الطلبات والمنتجات بطريقة سهلة وفعالة.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  الطلبات
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  المنتجات
                </Link>
              </li>
              <li>
                <Link
                  to="/orders/new"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  طلب جديد
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <p className="text-gray-300 mb-2">
              هل لديك أي استفسار؟ لا تتردد في التواصل معنا.
            </p>
            <a
              href="mailto:info@orderman.com"
              className="text-accent hover:underline"
            >
              info@orderman.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>جميع الحقوق محفوظة &copy; {currentYear} - نظام إدارة الطلبات</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
