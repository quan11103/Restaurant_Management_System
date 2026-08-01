import React, { useState } from 'react';
import axiosClient from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAlert } from '../../../components/Alert';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import './RegisterForm.css';

const RegisterForm: React.FC = () => {
    const { showAlert } = useAlert();

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra validate đầu vào
        if (!fullName.trim() || !username.trim() || !password || !confirmPassword) {
            showAlert('warning', 'Vui lòng điền đầy đủ các trường bắt buộc (*).', 'Cảnh báo');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('warning', 'Mật khẩu xác nhận không khớp.', 'Cảnh báo');
            return;
        }

        setIsLoading(true);

        try {
            await axiosClient.post('/auth/register', {
                fullName,
                username,
                email: email || undefined,
                phone: phone || undefined,
                password,
                role: 'CLIENT'
            });

            showAlert('success', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'Thành công');
            navigate('/login');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.';
            showAlert('error', message, 'Đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <form className="register-form" onSubmit={handleRegister}>
            <InputField
                label="Họ và tên (*)"
                type="text"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            />

            <InputField
                label="Tên đăng nhập (*)"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />

            <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            <InputField
                label="Số điện thoại"
                type="text"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            />

            <div className="password-field-wrapper">
                <InputField
                    label="Mật khẩu (*)"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="password-input-field"
                />
                <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div className="password-field-wrapper">
                <InputField
                    label="Xác nhận mật khẩu (*)"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className="password-input-field"
                />
                <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div style={{ marginTop: '10px' }}></div>

            <Button type="submit" fullWidth variant="primary" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>

            <div className="login-prompt">
                <span>Đã có tài khoản? </span>
                <button
                    type="button"
                    className="login-link-btn"
                    onClick={handleGoToLogin}
                >
                    Đăng nhập ngay
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;