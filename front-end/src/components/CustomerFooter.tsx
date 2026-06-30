import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import './CustomerFooter.css';

const CustomerFooter: React.FC = () => {
    return (
        <footer className="customer-footer">
            <div className="container footer-container">

                {/* Cột 1: Thông tin thương hiệu & liên hệ */}
                <div className="footer-col brand-col">
                    <div className="footer-logo-block">
                        <Logo className="footer-logo-image" />
                        <h3 className="footer-logo-text">HÒA HẢO</h3>
                    </div>
                    <p className="brand-desc">
                        Nền tảng đặt món trực tuyến hàng đầu, mang đến những bữa ăn nóng hổi và ngon miệng ngay tận cửa nhà bạn.
                    </p>
                    <ul className="contact-list">
                        <li>
                            <MapPin size={18} />
                            <span>122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội</span>
                        </li>
                        <li>
                            <Phone size={18} />
                            <span>1900 8888 (7:00 - 22:00)</span>
                        </li>
                        <li>
                            <Mail size={18} />
                            <span>support@hoahao.vn</span>
                        </li>
                    </ul>
                </div>

                {/* Cột 2: Hỗ trợ khách hàng */}
                <div className="footer-col">
                    <h3 className="footer-title">Hỗ trợ khách hàng</h3>
                    <ul className="footer-links">
                        <li><a href="/help">Trung tâm trợ giúp</a></li>
                        <li><a href="/terms">Điều khoản sử dụng</a></li>
                        <li><a href="/privacy">Chính sách bảo mật</a></li>
                        <li><a href="/refund">Chính sách hoàn tiền</a></li>
                        <li><a href="/faq">Câu hỏi thường gặp (FAQ)</a></li>
                    </ul>
                </div>

                {/* Cột 3: Về chúng tôi & mạng xã hội */}
                <div className="footer-col">
                    <h3 className="footer-title">Về Hòa Hảo</h3>
                    <ul className="footer-links">
                        <li><a href="/about">Giới thiệu công ty</a></li>
                        <li><a href="/careers">Tuyển dụng tài xế/quán ăn</a></li>
                        <li><a href="/blog">Blog ẩm thực</a></li>
                    </ul>

                    <h3 className="footer-title mt-4">Kết nối với chúng tôi</h3>
                    <div className="social-links">
                        <a href="https://facebook.com" aria-label="Facebook" className="social-icon" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                        </a>

                        <a href="https://instagram.com" aria-label="Instagram" className="social-icon" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>

                        <a href="https://youtube.com" aria-label="Youtube" className="social-icon" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 3.88 12 3.88 12 3.88s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Cột 4: Chứng nhận & thanh toán */}
                <div className="footer-col">
                    <h3 className="footer-title">Chứng nhận</h3>
                    <div className="cert-box">
                        <ShieldCheck size={24} className="text-highlight" />
                        <span>Đảm bảo vệ sinh an toàn thực phẩm</span>
                    </div>

                    <h3 className="footer-title mt-4">Phương thức thanh toán</h3>
                    <div className="payment-methods">
                        {/* Các icon/logo thanh toán có thể thay bằng thẻ <img> thật */}
                        <div className="payment-badge">COD</div>
                        <div className="payment-badge vnpay">VNPAY</div>
                        <div className="payment-badge momo">MoMo</div>
                        <div className="payment-badge atm">ATM/Visa</div>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Hoa Hao. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default CustomerFooter;